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
  RadioGroup,
  Radio,
  FormLabel,
  FormControlLabel,
} from "@mui/material";
import ProgramField from "../ProgramPreview/ProgramFieldLocal";
import { useState } from "react";

export const AddMusicPopup = (props) => {
  const {
    open,
    handleClose,
    handleSaveSong,
    setScheduledMusic,
    scheduledMusic,
    members,
    hymns,
    disabledTypes,
  } = props;

  const [performer, setPerformer] = useState("Ward Choir");

  const handleChange = (e) => {
    setPerformer(e.target.value);
    setScheduledMusic((prev) => ({
      ...prev,
      performer: e.target.value,
    }));
    if (
      e.target.value === "Ward Choir" ||
      e.target.value === "Ward Member" ||
      "Other"
    ) {
      setScheduledMusic((prev) => ({
        ...prev,
        hymn_number: undefined,
      }));
    }
  };

  const getFields = () => {
    const type = scheduledMusic.type;
    if (type === "intermediate") {
      return (
        <Box display={"flex"} flexDirection={"column"} rowGap={"1rem"}>
          <FormControl>
            <FormLabel id="performer">Performer</FormLabel>
            <RadioGroup
              row
              aria-labelledby="performer"
              name="performer"
              value={performer}
              onChange={handleChange}
              defaultChecked={performer}
            >
              <FormControlLabel
                value="Ward Choir"
                control={<Radio />}
                label="Ward Choir"
              />
              <FormControlLabel
                value="Ward Member"
                control={<Radio />}
                label="Member"
              />
              <FormControlLabel
                value="Congregation"
                control={<Radio />}
                label="Congregation"
              />
              <FormControlLabel
                value="Other"
                control={<Radio />}
                label="Other"
              />
            </RadioGroup>
          </FormControl>
          {performer === "Ward Member" ? (
            <ProgramField
              key={"performer"}
              formValues={scheduledMusic}
              setFormValues={setScheduledMusic}
              options={members}
              fieldName={"performer"}
              fieldLabel={"Member"}
              optionText={"first_name last_name"}
            />
          ) : null}
          {performer === "Other" ? (
            <TextField
              autoFocus={false}
              fullWidth
              value={scheduledMusic?.performer}
              onChange={(e) =>
                setScheduledMusic((prev) => ({
                  ...prev,
                  performer: e.target.value,
                }))
              }
              label="Performer(s)"
              name="performer"
            />
          ) : null}
          {performer === "Congregation" ? (
            <ProgramField
              key={"hymn_number"}
              formValues={scheduledMusic}
              setFormValues={setScheduledMusic}
              options={hymns}
              fieldName={"hymn_number"}
              fieldLabel={"Hymn Number"}
              optionText={"number name"}
            />
          ) : (
            <TextField
              autoFocus={false}
              fullWidth
              value={scheduledMusic?.name}
              onChange={(e) =>
                setScheduledMusic((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              label="Song"
              name="song-info"
            />
          )}
        </Box>
      );
    } else {
      return (
        <ProgramField
          key={"hymn_number"}
          formValues={scheduledMusic}
          setFormValues={setScheduledMusic}
          options={hymns}
          fieldName={"hymn_number"}
          fieldLabel={"Hymn Number"}
          optionText={"number name"}
        />
      );
    }
  };

  const menuItems = [
    !disabledTypes?.includes("opening") && (
      <MenuItem key="opening" value="opening">
        Opening
      </MenuItem>
    ),
    !disabledTypes?.includes("sacrament") && (
      <MenuItem key="sacrament" value="sacrament">
        Sacrament
      </MenuItem>
    ),
    !disabledTypes?.includes("closing") && (
      <MenuItem key="closing" value="closing">
        Closing
      </MenuItem>
    ),
    !disabledTypes?.includes("intermediate") && (
      <MenuItem key="intermediate" value="intermediate">
        Intermediate
      </MenuItem>
    ),
  ];

  const enabledMenuItems = menuItems.filter(Boolean);

  const defaultValue = enabledMenuItems[0] && enabledMenuItems[0].props.value;

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
        <DialogTitle>Add Music</DialogTitle>
        <DialogContent style={{ zIndex: 1 }}>
          <Box rowGap="1rem" display="flex" flexDirection="column" mt="1rem">
            <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
              <InputLabel id="music-type-label">Select Type</InputLabel>
              <Select
                labelId="music-type-label"
                value={scheduledMusic.type}
                defaultValue={defaultValue}
                onChange={(event) => {
                  const selectedType = event.target.value;
                  setScheduledMusic((prev) => ({
                    ...prev,
                    type: selectedType,
                  }));
                }}
                label="Music Type"
              >
                {enabledMenuItems}
              </Select>
            </FormControl>
          </Box>
          {getFields()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={() => handleSaveSong()}
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
export default AddMusicPopup;
