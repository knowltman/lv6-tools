import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  Grid,
  Alert,
  Snackbar,
} from "@mui/material";
import axios from "axios";
import { membersStore } from "../stores/members";
import { usersStore } from "../stores/users";

const MyAccount = () => {
  const user = membersStore((state) => state.user);
  const setUser = membersStore((state) => state.setUser);
  const { users, fetchUsers, updateUser } = usersStore();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    image: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageKey, setImageKey] = useState(0); // Force re-render key
  const [imageLocallyUpdated, setImageLocallyUpdated] = useState(false); // Track if image was updated locally
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [currentUserData, setCurrentUserData] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (users && user) {
      // Find the current user's data from the users array
      const userData = users.find((u) => u.memberId === user.id);
      if (userData) {
        setCurrentUserData(userData);
        setFormData((prev) => ({
          username: userData.username,
          password: "",
          confirmPassword: "",
          // Preserve locally uploaded image if it was recently updated
          image: imageLocallyUpdated ? prev.image : userData.image || "",
        }));
      }
    }
  }, [users, user, imageLocallyUpdated]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    console.log("File selected:", file);
    if (file) {
      // Client-side validation
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/bmp",
        "image/tiff",
        "image/svg+xml",
      ];
      const allowedExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".bmp",
        ".tiff",
        ".tif",
        ".svg",
      ];

      const fileExtension = file.name
        .toLowerCase()
        .substring(file.name.lastIndexOf("."));

      if (file.size > maxSize) {
        setSnackbar({
          open: true,
          message: `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds the 10MB limit`,
          severity: "error",
        });
        return;
      }

      if (
        !allowedTypes.includes(file.type) &&
        !allowedExtensions.includes(fileExtension)
      ) {
        setSnackbar({
          open: true,
          message: `Invalid file type. Please select a valid image file.`,
          severity: "error",
        });
        return;
      }

      setSelectedFile(file);
      // Automatically upload when file is selected
      await handleFileUpload(file);
    }
  };

  const handleFileUpload = async (fileToUpload = selectedFile) => {
    if (!fileToUpload) {
      console.log("No file to upload");
      return;
    }

    console.log(
      "Starting upload for file:",
      fileToUpload.name,
      "Size:",
      fileToUpload.size,
      "Type:",
      fileToUpload.type,
    );
    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("image", fileToUpload);

      const response = await axios.post("/api/upload", formDataUpload);

      if (response.data.success) {
        // Use a more robust cache-busting approach
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        const newImageUrl = `${response.data.url}?t=${timestamp}&r=${random}`;
        console.log("New image URL:", newImageUrl);

        // Update form data
        setFormData((prev) => ({
          ...prev,
          image: newImageUrl,
        }));

        // Persist the image to database immediately
        if (currentUserData) {
          try {
            await updateUser(currentUserData.id, {
              image: newImageUrl,
            });
            console.log("Image persisted to database");

            // Refresh the members data to get the updated image
            await membersStore.getState().fetchAllMembers();
            console.log("Members data refreshed");
          } catch (persistError) {
            console.error("Failed to persist image to database:", persistError);
            // Continue with local update even if persistence fails
            // Update the membersStore user as fallback
            if (user) {
              setUser({
                ...user,
                image: newImageUrl,
              });
            }
          }
        } else {
          // Fallback if no currentUserData
          if (user) {
            setUser({
              ...user,
              image: newImageUrl,
            });
          }
        }

        // Mark that image was locally updated
        setImageLocallyUpdated(true);

        // Small delay to ensure file is fully written before forcing re-render
        setTimeout(() => {
          setImageKey((prev) => prev + 1);
          console.log("Image key updated to force re-render");
        }, 100);

        setSelectedFile(null);
        setSnackbar({
          open: true,
          message: "Image uploaded successfully",
          severity: "success",
        });

        // Reset the file input so the same file can be selected again
        const fileInput = document.getElementById("profile-image-input");
        if (fileInput) {
          fileInput.value = "";
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      let errorMessage = `Failed to upload image: ${error.message}`;

      if (error.response?.data?.error) {
        errorMessage = `${error.response.data.error}${error.response.data.details ? ": " + error.response.data.details : ""}`;
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: "",
    }));
    setSelectedFile(null);
  };

  const handleSave = async () => {
    if (formData.password && formData.password !== formData.confirmPassword) {
      setSnackbar({
        open: true,
        message: "Passwords do not match",
        severity: "error",
      });
      return;
    }

    if (!currentUserData) {
      setSnackbar({
        open: true,
        message: "User data not found",
        severity: "error",
      });
      return;
    }

    setLoading(true);
    try {
      await updateUser(currentUserData.id, {
        username: formData.username,
        password: formData.password || undefined, // Only update if provided
        image: formData.image,
      });

      // Update the membersStore user with the new image
      if (user) {
        setUser({
          ...user,
          image: formData.image,
        });
      }

      // Reset the local update flag since database is now up to date
      setImageLocallyUpdated(false);

      setSnackbar({
        open: true,
        message: "Profile updated successfully",
        severity: "success",
      });

      // Refresh users data
      fetchUsers();
    } catch (error) {
      console.error("Error updating profile:", error);
      setSnackbar({
        open: true,
        message: "Failed to update profile",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (!user || !currentUserData) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 500 }}>
        My Account
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Box sx={{ position: "relative" }}>
            <Avatar
              key={`main-avatar-${imageKey}`} // Force re-render when image changes
              src={formData.image}
              alt={`${user.first_name} ${user.last_name}`}
              sx={{
                width: 80,
                height: 80,
                mr: 3,
                cursor: uploading ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                opacity: uploading ? 0.6 : 1,
                "&:hover": {
                  opacity: uploading ? 0.6 : 0.8,
                  transform: uploading ? "none" : "scale(1.05)",
                  boxShadow: uploading ? "none" : 2,
                },
              }}
              onClick={
                uploading
                  ? undefined
                  : () => document.getElementById("profile-image-input").click()
              }
              onError={(e) => {
                console.log(
                  "Avatar image failed to load, retrying with fresh URL",
                );
                // If image fails to load, try to refresh it with a new cache-busting parameter
                const currentSrc = e.target.src;
                const baseUrl = currentSrc.split("?")[0];
                const newSrc = `${baseUrl}?retry=${Date.now()}`;
                e.target.src = newSrc;
              }}
            >
              {user.first_name && user.first_name.charAt(0)}
            </Avatar>
            {/* Upload indicator */}
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                right: 15,
                bgcolor: uploading ? "grey.500" : "primary.main",
                color: "white",
                borderRadius: "50%",
                width: 24,
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: "bold",
                cursor: uploading ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
              }}
              onClick={
                uploading
                  ? undefined
                  : () => document.getElementById("profile-image-input").click()
              }
            >
              {uploading ? "..." : "+"}
            </Box>
            <input
              id="profile-image-input"
              type="file"
              hidden
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp,image/tiff,image/svg+xml,.jpg,.jpeg,.png,.gif,.webp,.bmp,.tiff,.tif,.svg"
              onChange={handleFileSelect}
            />
          </Box>
          <Box>
            <Typography variant="h6">
              {user.first_name} {user.last_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.calling}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Username"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              variant="outlined"
              helperText="Leave blank to keep current password"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                handleInputChange("confirmPassword", e.target.value)
              }
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={loading}
                sx={{ minWidth: 120 }}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MyAccount;
