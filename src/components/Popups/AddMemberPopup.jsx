import React, { useState, useEffect } from "react";
import { membersStore } from "../../stores/members";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  Checkbox,
  FormControlLabel,
  Box,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import axios from "axios";

const AddMemberPopup = ({
  open,
  handleClose,
  outsideCreate = null,
  setOutsideCreate = null,
}) => {
  const defaultValues = {
    first_name: outsideCreate?.firstName || "",
    last_name: outsideCreate?.lastName || "",
    isYouth: false,
    can_ask: true,
    calling: "",
  };
  const [formValues, setFormValues] = useState(defaultValues);
  const { fetchAllMembers } = membersStore();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormValues({
      ...formValues,
      [name]: checked,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`/api/add-member`, {
        first_name: outsideCreate?.firstName || formValues.first_name,
        last_name: outsideCreate?.lastName || formValues.last_name,
        sex: "M", // Default to Male
        isYouth: formValues.isYouth ? 1 : null,
        can_ask: formValues.can_ask ? 1 : 0,
        calling: formValues.calling || null,
      });

      if (response.status === 200) {
        handleClose();
        setFormValues(defaultValues);
        if (setOutsideCreate) {
          setOutsideCreate(null);
        }
        await fetchAllMembers(); // Call the fetchMembers function directly from the store
      } else {
        console.error("Unexpected response:", response);
      }
    } catch (error) {
      console.error("Error saving member:", error);
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    setFormValues(defaultValues);
    if (handleClose) {
      handleClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} suppressContentEditableWarning>
      <DialogTitle>Add Ward Member</DialogTitle>
      <DialogContent>
        <form onSubmit={(e) => e.preventDefault()}>
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
            {/* Gender field removed per user request */}
            {/* <FormControl>
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
            </FormControl> */}
            <FormControl fullWidth margin="normal">
              <InputLabel>Calling</InputLabel>
              <Select
                label="Calling"
                name="calling"
                value={formValues.calling}
                onChange={handleChange}
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
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    name="isYouth"
                    checked={formValues.isYouth}
                    onChange={handleCheckboxChange}
                  />
                }
                label="Youth"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="can_ask"
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
        <Button onClick={handleCancel} variant="text">
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          variant="contained"
          color="primary"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMemberPopup;
