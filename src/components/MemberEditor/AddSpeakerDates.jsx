import {
  Button,
  Checkbox,
  FormControlLabel,
  Box,
  InputAdornment,
  IconButton,
} from "@mui/material";
import RemoveCircle from "@mui/icons-material/RemoveCircle";
import { DatePicker } from "@mui/x-date-pickers"; // Import DatePicker

const AddSpeakerDates = (props) => {
  const {
    fieldName,
    fieldLabel,
    formValues,
    setFormValues,
    checkboxState,
    setCheckboxState,
    checkboxLabel,
  } = props;

  const addNewValueField = () => {
    setFormValues((prev) => ({
      ...prev,
      [fieldName]: [...prev[fieldName], null], // Use null for initial date
    }));
  };

  const handleRemoveField = (index) => {
    const newValues = [...formValues[fieldName]];
    newValues.splice(index, 1);
    setFormValues((prev) => ({
      ...prev,
      [fieldName]: newValues,
    }));
    if (newValues.length === 0) {
      setCheckboxState(false);
    }
  };

  const handleValueChange = (index) => (date) => {
    const newValues = [...formValues[fieldName]];
    newValues[index] = date; // Update with the date object
    setFormValues((prev) => ({
      ...prev,
      [fieldName]: newValues,
    }));
  };

  return (
    <Box display="flex" flexDirection="column" marginBottom={".5rem"}>
      <FormControlLabel
        style={{ marginLeft: 0 }}
        control={
          <Checkbox
            checked={checkboxState}
            onClick={() => setCheckboxState(!checkboxState)}
          />
        }
        label={checkboxLabel}
      />

      {checkboxState && (
        <>
          {formValues[fieldName].map((date, index) => (
            <DatePicker
              key={index}
              value={null}
              onChange={handleValueChange(index)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  placeholder={`${fieldLabel} ${index + 1}`}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => handleRemoveField(index)}>
                          <RemoveCircle />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          ))}

          <Button
            variant="text"
            onClick={addNewValueField}
            style={{ marginTop: "10px" }}
          >
            Add {fieldLabel}
          </Button>
        </>
      )}
    </Box>
  );
};

export default AddSpeakerDates;
