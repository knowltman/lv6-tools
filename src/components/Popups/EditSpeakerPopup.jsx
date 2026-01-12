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
import { useRef, useEffect } from "react";
import { speakersStore } from "../../stores/speakers";
import axios from "axios";

export const EditSpeakerPopup = (props) => {
  const {
    openEdit,
    handleClose,
    selectedMember,
    members,
    scheduledSpeaker,
    setScheduledSpeaker,
  } = props;

  const subjectRef = useRef();
  const apiURL = import.meta.env.VITE_API_URL;
  const { getSpeakerHistory2 } = speakersStore();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        handleSaveEdit();
      }
    };

    if (openEdit) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openEdit]);

  const handleSaveEdit = async () => {
    const currentSubject = subjectRef.current.value;
    try {
      const response = await axios.patch(
        `${apiURL}/api/speaker-update/${scheduledSpeaker.id}`,
        {
          subject: currentSubject,
        }
      );

      if (response.status === 200) {
        getSpeakerHistory2();
        handleClose();
      }
    } catch (error) {
      console.error("Failed to update speaker date/order", error);
    }
  };

  return (
    <Dialog
      open={openEdit}
      onClose={handleClose}
      PaperProps={{
        style: {
          overflowY: "visible",
          width: "800px",
        },
      }}
    >
      <DialogTitle>Edit Speaker</DialogTitle>
      <DialogContent>
        <Box rowGap="1rem" display="flex" flexDirection="column" mt="1rem">
          <ProgramField
            key={"member"}
            formValues={selectedMember}
            options={members}
            fieldName={"member"}
            fieldLabel={"Member"}
            optionText={"first_name last_name"}
            autoFocus={true}
            disabled
          />
          <TextField
            autoFocus={false}
            fullWidth
            inputRef={subjectRef}
            value={scheduledSpeaker.subject}
            onChange={(e) =>
              setScheduledSpeaker((prev) => ({
                ...prev,
                subject: e.target.value,
              }))
            }
            label="Subject"
            name="subject"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose()}>Cancel</Button>
        <Button
          onClick={() => handleSaveEdit()}
          color="primary"
          variant="contained"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default EditSpeakerPopup;
