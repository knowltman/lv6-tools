import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  DialogActions,
  Button,
} from "@mui/material";
import ProgramField from "../ProgramPreview/ProgramFieldLocal";

const AddPrayerPopup = (props) => {
  const {
    open,
    handleClose,
    handleSavePrayer,
    selectedMember,
    setSelectedMember,
    members,
  } = props;
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={"lg"}
      PaperProps={{
        style: {
          overflowY: "visible",
          width: "600px",
        },
      }}
    >
      <DialogTitle>Add Prayer</DialogTitle>
      <DialogContent style={{ zIndex: 1 }}>
        <Box rowGap="1rem" display="flex" flexDirection="column" mt="1rem">
          <ProgramField
            key={"member"}
            formValues={selectedMember}
            setFormValues={setSelectedMember}
            options={members}
            fieldName={"member"}
            fieldLabel={"Member"}
            optionText={"first_name last_name"}
            autoFocus={true}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={() => handleSavePrayer()}
          color="primary"
          variant="contained"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default AddPrayerPopup;
