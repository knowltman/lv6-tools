import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";

const AddEventPopup = ({
  open,
  handleClose,
  handleSave,
  eventValue,
  setEventValue,
}) => {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        style: {
          overflowY: "visible",
          width: "400px",
        },
      }}
    >
      <DialogTitle>Add Program Event</DialogTitle>
      <DialogContent>
        <Box rowGap="1rem" display="flex" flexDirection="column" mt="1rem">
          <TextField
            autoFocus
            fullWidth
            value={eventValue.subject || ""}
            onChange={(e) =>
              setEventValue((prev) => ({
                ...prev,
                subject: e.target.value,
              }))
            }
            label="Event"
            name="event"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          color="primary"
          variant="contained"
          disabled={!eventValue.subject}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEventPopup;
