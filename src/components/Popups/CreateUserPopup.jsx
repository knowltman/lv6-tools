import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Avatar,
  IconButton,
  Alert,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Close, PhotoCamera } from "@mui/icons-material";
import { usersStore } from "../../stores/users";
import { membersStore } from "../../stores/members";
import axios from "axios";

const CreateUserPopup = ({ open, handleClose, memberData = null }) => {
  const { createUser, updateUser } = usersStore();
  const { updateMemberField } = membersStore();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    image: "",
    sex: "M",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset form when dialog opens/closes or memberData changes
  React.useEffect(() => {
    if (open) {
      if (memberData) {
        // Pre-populate with member data for promotion
        // Only use image if it's a valid uploaded image path
        const isValidImagePath = memberData.image && memberData.image.startsWith('/uploads/');
        setFormData({
          username: "",
          password: "",
          confirmPassword: "",
          image: isValidImagePath ? memberData.image : "",
          sex: memberData.sex || "M",
        });
      } else {
        // Reset for new user creation
        setFormData({
          username: "",
          password: "",
          confirmPassword: "",
          image: "",
          sex: "M",
        });
      }
      setSelectedFile(null);
      setError("");
    }
  }, [open, memberData]);

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
        setError(
          `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds the 10MB limit`,
        );
        return;
      }

      if (
        !allowedTypes.includes(file.type) &&
        !allowedExtensions.includes(fileExtension)
      ) {
        setError(`Invalid file type. Please select a valid image file.`);
        return;
      }

      setSelectedFile(file);
      // Automatically upload when file is selected
      await handleFileUpload(file);
    }
  };

  const handleFileUpload = async (fileToUpload = selectedFile) => {
    if (!fileToUpload) return;

    console.log("Starting upload for file:", fileToUpload.name);
    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("image", fileToUpload);

      console.log("Sending upload request...");
      const response = await axios.post("/api/upload", formDataUpload);
      console.log("Upload response:", response);

      if (response.data.success) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        const newImageUrl = `${response.data.url}?t=${timestamp}&r=${random}`;

        setFormData((prev) => ({
          ...prev,
          image: newImageUrl,
        }));
        setSelectedFile(null);

        // Reset the file input so the same file can be selected again
        const fileInput = document.getElementById("profile-image-input");
        if (fileInput) {
          fileInput.value = "";
        }
      } else {
        setError(response.data.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError(error.response?.data?.error || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.username || !formData.password) {
      setError("Username and password are required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (memberData) {
        // Promoting existing member to user
        await createUser({
          username: formData.username,
          password: formData.password,
          memberId: memberData.id,
          calling: memberData.calling,
          image: formData.image,
          sex: formData.sex,
          active: 1,
          can_ask: 1,
        });
      } else {
        // Creating new user
        await createUser({
          username: formData.username,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          calling: formData.calling,
          image: formData.image,
          sex: formData.sex,
          active: 1,
          can_ask: 1,
        });
      }

      // Refresh data
      await usersStore.getState().fetchUsers();
      await membersStore.getState().fetchAllMembers();

      handleClose();
    } catch (error) {
      console.error("Error creating user:", error);
      setError(error.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const title = memberData
    ? `Promote ${memberData.first_name} ${memberData.last_name} to User`
    : "Create New User";

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {title}
        <IconButton
          onClick={handleClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {memberData && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This will create a user account for {memberData.first_name}{" "}
              {memberData.last_name}. They will be able to log in with the
              username and password you provide.
            </Typography>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Profile Image */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Avatar
                sx={{ width: 80, height: 80 }}
                src={formData.image}
                key={formData.image || "default-avatar"}
              >
                {!formData.image && <PhotoCamera />}
              </Avatar>
              <Box>
                <input
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp,image/tiff,image/svg+xml,.jpg,.jpeg,.png,.gif,.webp,.bmp,.tiff,.tif,.svg"
                  style={{ display: "none" }}
                  id="profile-image-input"
                  type="file"
                  onChange={handleFileSelect}
                />
                <label htmlFor="profile-image-input">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoCamera />}
                    disabled={uploading}
                  >
                    {uploading ? "Uploading..." : "Upload Photo"}
                  </Button>
                </label>
              </Box>
            </Box>

            {/* First and Last Name for new user */}
            {!memberData && (
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <TextField
                  label="First Name"
                  value={formData.first_name || ""}
                  onChange={(e) =>
                    handleInputChange("first_name", e.target.value)
                  }
                  fullWidth
                />
                <TextField
                  label="Last Name"
                  value={formData.last_name || ""}
                  onChange={(e) =>
                    handleInputChange("last_name", e.target.value)
                  }
                  fullWidth
                />
              </Box>
            )}

            {/* Gender radio group - now below first/last name */}
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel component="legend">Gender</FormLabel>
              <RadioGroup
                row
                aria-labelledby="gender"
                name="sex"
                value={formData.sex}
                onChange={(e) => handleInputChange("sex", e.target.value)}
              >
                <FormControlLabel
                  value="M"
                  control={<Radio selected={formData.sex === "M"} />}
                  label="Male"
                />
                <FormControlLabel
                  value="F"
                  control={<Radio selected={formData.sex === "F"} />}
                  label="Female"
                />
              </RadioGroup>
            </FormControl>

            {/* Username */}
            <TextField
              fullWidth
              label="Username"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              required
            />

            {/* Password and Confirm Password side by side */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                required
                fullWidth
              />
            </Box>

            {/* Member info (only for new users) */}
            {!memberData && (
              <FormControl fullWidth>
                <InputLabel>Calling</InputLabel>
                <Select
                  value={formData.calling || ""}
                  onChange={(e) => handleInputChange("calling", e.target.value)}
                  label="Calling"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value="Bishop">Bishop</MenuItem>
                  <MenuItem value="Bishopric First Counselor">
                    Bishopric First Counselor
                  </MenuItem>
                  <MenuItem value="Bishopric Second Counselor">
                    Bishopric Second Counselor
                  </MenuItem>
                  <MenuItem value="Stake Representative">
                    Stake Representative
                  </MenuItem>
                  <MenuItem value="Ward Executive Secretary">
                    Ward Executive Secretary
                  </MenuItem>
                  <MenuItem value="Ward Clerk">Ward Clerk</MenuItem>
                  <MenuItem value="Chorister">Chorister</MenuItem>
                  <MenuItem value="Organist">Organist</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading || !formData.username || !formData.password}
        >
          {loading
            ? "Creating..."
            : memberData
              ? "Promote to User"
              : "Create User"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateUserPopup;
