import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Paper,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { dataStore } from "../stores/data";
import axios from "axios";

const Hymns = () => {
  const { hymns, getAllHymns } = dataStore();
  const [open, setOpen] = useState(false);
  const [newHymn, setNewHymn] = useState({ number: "", name: "" });

  useEffect(() => {
    getAllHymns();
  }, [getAllHymns]);

  const handleAddHymn = async () => {
    try {
      await axios.post("/api/hymns", newHymn);
      setNewHymn({ number: "", name: "" });
      setOpen(false);
      getAllHymns(); // Refresh the list
    } catch (error) {
      console.error("Error adding hymn:", error);
    }
  };

  const handleDeleteHymn = async (id) => {
    try {
      await axios.delete(`/api/hymns/${id}`);
      getAllHymns(); // Refresh the list
    } catch (error) {
      console.error("Error deleting hymn:", error);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      {/* Sticky Header */}
      <Box
        sx={{
          position: "sticky",
          top: "5rem", // Account for navbar height
          zIndex: 1,
          backgroundColor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
          px: "2rem",
          py: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 500 }}>
          Hymns
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
        >
          Add Hymn
        </Button>
      </Box>

      {/* Scrollable Content */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: "2rem",
          pb: "6rem",
          width: "100%",
        }}
      >
        <Paper elevation={2} sx={{ mt: 2, width: "100%" }}>
          <List sx={{ width: "100%" }}>
            {hymns.map((hymn) => (
              <ListItem
                key={hymn.id}
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={() => handleDeleteHymn(hymn.id)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                }
                sx={{ width: "100%" }}
              >
                <ListItemText primary={`${hymn.number}. ${hymn.name}`} />
              </ListItem>
            ))}
          </List>
        </Paper>

        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add New Hymn</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Hymn Number"
              type="number"
              fullWidth
              value={newHymn.number}
              onChange={(e) =>
                setNewHymn({ ...newHymn, number: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Hymn Name"
              fullWidth
              value={newHymn.name}
              onChange={(e) => setNewHymn({ ...newHymn, name: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAddHymn}
              variant="contained"
              disabled={!newHymn.number || !newHymn.name}
            >
              Add Hymn
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default Hymns;
