import React, { useState } from "react";
import { membersStore } from "../../stores/members";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  Checkbox,
  FormControlLabel,
  Box,
} from "@mui/material";
import axios from "axios";

const AddMemberPopup = ({
  open,
  handleClose,
  outsideCreate,
  setOutsideCreate,
}) => {
  const defaultValues = {
    first_name: outsideCreate?.firstName || "",
    last_name: outsideCreate?.lastName || "",
    sex: "",
    isYouth: false,
    can_ask: true,
  };
  const [formValues, setFormValues] = useState(defaultValues);
  const { fetchAllMembers } = membersStore();

  const apiURL = import.meta.env.VITE_API_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleCheckboxChange = (e) => {
    setFormValues({
      ...formValues,
      isYouth: e.target.checked,
    });
  };

  const handleSave = async () => {
    try {
      const response = await axios.post(`${apiURL}/api/add-member`, {
        first_name: outsideCreate?.firstName || formValues.first_name,
        last_name: outsideCreate?.lastName || formValues.last_name,
        sex: formValues.sex,
        isYouth: formValues.isYouth ? 1 : null,
        can_ask: formValues.can_ask ? 1 : 0,
      });

      if (response.status === 200) {
        handleClose();
        setFormValues(defaultValues);
        setOutsideCreate(null);
        await fetchAllMembers(); // Call the fetchMembers function directly from the store
      } else {
        console.error("Unexpected response:", response);
      }
    } catch (error) {
      console.error("Error saving member:", error);
    }
  };

  const handleCancel = () => {
    setFormValues(defaultValues);
    setOutsideCreate(null);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} suppressContentEditableWarning>
      <DialogTitle>Add Ward Member</DialogTitle>
      <DialogContent>
        <form>
          <div className="two-col">
            <TextField
              fullWidth
              margin="normal"
              label="First Name"
              name="first_name"
              value={outsideCreate?.firstName || formValues.first_name}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Last Name"
              name="last_name"
              value={outsideCreate?.lastName || formValues.last_name}
              onChange={handleChange}
            />
          </div>
          {/* <FormControl fullWidth margin="normal">
            <InputLabel>Gender</InputLabel>
            <Select
              label="Gender"
              name="sex"
              fullWidth
              value={formValues.sex}
              onChange={handleChange}
            >
              <MenuItem value={"M"}>Male</MenuItem>
              <MenuItem value={"F"}>Female</MenuItem>
            </Select>
          </FormControl> */}
          <Box display="flex" flexDirection="column" rowGap="1rem">
            <FormControl>
              <FormLabel id="sex">Gender</FormLabel>
              <RadioGroup
                row
                aria-labelledby="sex"
                name="sex"
                value={formValues.sex}
                onChange={handleChange}
              >
                <FormControlLabel value="M" control={<Radio />} label="Male" />
                <FormControlLabel
                  value="F"
                  control={<Radio />}
                  label="Female"
                />
              </RadioGroup>
            </FormControl>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formValues.isYouth}
                    onChange={handleCheckboxChange}
                  />
                }
                label="Youth"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formValues.can_ask}
                    onChange={handleCheckboxChange}
                  />
                }
                label="Can be asked speak/pray"
              />
            </Box>
          </Box>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMemberPopup;
