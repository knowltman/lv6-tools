import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  DialogActions,
  Button,
} from "@mui/material";
import ProgramField from "../ProgramPreview/ProgramFieldLocal";

export const AddOrganistChorister = (props) => {
  const {
    open,
    handleClose,
    handleSaveChoristerOrganist,
    choristerOrganistForm,
    setChoristerOrganistForm,
    members,
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
      <DialogTitle>Chorister and Organist</DialogTitle>
      <DialogContent style={{ zIndex: 1 }}>
        <Box rowGap="1rem" display="flex" flexDirection="column" mt="1rem">
          <ProgramField
            key={"chorister"}
            formValues={{
              chorister: choristerOrganistForm.chorister,
            }}
            setFormValues={setChoristerOrganistForm}
            options={members.filter((member) => member.calling === "Chorister")}
            fieldName={"chorister"}
            fieldLabel={"Chorister"}
            optionText={"first_name last_name"}
            autoFocus={true}
          />
          <ProgramField
            key={"organist"}
            formValues={{
              organist: choristerOrganistForm.organist,
            }}
            setFormValues={setChoristerOrganistForm}
            options={members.filter((member) => member.calling === "Organist")}
            fieldName={"organist"}
            fieldLabel={"Organist"}
            optionText={"first_name last_name"}
            autoFocus={false}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={() => handleSaveChoristerOrganist()}
          color="primary"
          variant="contained"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default AddOrganistChorister;
