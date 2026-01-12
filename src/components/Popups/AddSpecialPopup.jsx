import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

export const AddSpecialPopup = (props) => {
  const { open, handleClose, handleSave, specialSunday, setSpecialSunday } =
    props;

  const getFields = () => {
    if (specialSunday.type === "Other") {
      return (
        <Box display={"flex"} flexDirection={"column"} rowGap={"1rem"}>
          <TextField
            autoFocus={false}
            fullWidth
            value={specialSunday.description || ""}
            onChange={(e) =>
              setSpecialSunday((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            label="Description"
            name="description"
          />
        </Box>
      );
    }
  };

  const menuItems = [
    <MenuItem key="ward conference" value="Ward Conference">
      Ward Conference
    </MenuItem>,
    <MenuItem key="stake conference" value="Stake Conference">
      Stake Conference
    </MenuItem>,
    <MenuItem key="fast sunday" value="Fast Sunday">
      Fast Sunday
    </MenuItem>,
    <MenuItem key="primary program" value="Primary Program">
      Primary Program
    </MenuItem>,
    <MenuItem key="christmas program" value="Christmas Program">
      Christmas Program
    </MenuItem>,
    <MenuItem key="other" value="Other">
      Other
    </MenuItem>,
  ];

  return (
    <>
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
        <DialogTitle>Add Special Sunday</DialogTitle>
        <DialogContent>
          <Box rowGap="1rem" display="flex" flexDirection="column" mt="1rem">
            <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
              <InputLabel id="music-type-label">Select Type</InputLabel>
              <Select
                labelId="music-type-label"
                value={specialSunday.type}
                onChange={(event) => {
                  const selectedType = event.target.value;
                  setSpecialSunday((prev) => ({
                    ...prev,
                    type: selectedType,
                  }));
                }}
                label="Music Type"
              >
                {menuItems}
              </Select>
            </FormControl>
          </Box>
          {getFields()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={() => handleSave()}
            color="primary"
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
export default AddSpecialPopup;
