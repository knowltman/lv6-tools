import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import ProgramField from "../ProgramPreview/ProgramFieldLocal";

export const AddSpeakerPopup = (props) => {
  const {
    open,
    handleClose,
    handleSaveSpeaker,
    selectedMember,
    setSelectedMember,
    members,
    scheduledSpeaker,
    setScheduledSpeaker,
    onAddMember,
  } = props;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        style: {
          overflowY: "visible",
          width: "800px",
        },
      }}
    >
      <DialogTitle>Add Speaker</DialogTitle>
      <DialogContent style={{ zIndex: 1 }}>
        <Box rowGap="1rem" display="flex" flexDirection="column" mt="1rem">
          <ProgramField
            key={"member"}
            formValues={
              selectedMember || { member: { first_name: "", last_name: "" } }
            }
            setFormValues={setSelectedMember}
            options={members}
            fieldName={"member"}
            fieldLabel={"Member"}
            optionText={"first_name last_name"}
            autoFocus={true}
            onAddMember={(newMember) => {
              onAddMember(newMember);
            }}
          />
          <TextField
            autoFocus={false}
            fullWidth
            value={scheduledSpeaker.subject}
            onChange={(e) =>
              setScheduledSpeaker((prev) => ({
                ...prev,
                subject: e.target.value,
              }))
            }
            label="Subject"
            name="subject"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSaveSpeaker();
              }
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={() => handleSaveSpeaker()}
          color="primary"
          variant="contained"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default AddSpeakerPopup;
