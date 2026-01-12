import {
  Button,
  Checkbox,
  FormControlLabel,
  Box,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import RemoveCircle from "@mui/icons-material/RemoveCircle";
import { formStore } from "../../stores/formValues";

const DynamicList = (props) => {
  const {
    fieldName,
    fieldLabel,
    checkboxState,
    setCheckboxState,
    checkboxLabel,
  } = props;

  // Function to add new empty value field
  const addNewValueField = () => {
    formStore.setState((state) => ({
      formValues2: {
        ...state.formValues2,
        [fieldName]: [...(state.formValues2[fieldName] || []), ""],
      },
    }));
  };

  // Function to remove a value field by index
  const handleRemoveField = (index) => {
    formStore.setState((state) => {
      const newValues = [...(state.formValues2[fieldName] || [])];
      newValues.splice(index, 1); // Remove the item at the specified index

      return {
        formValues2: {
          ...state.formValues2,
          [fieldName]: newValues,
        },
      };
    });

    if ((formStore.getState().formValues2[fieldName] || []).length === 0) {
      setCheckboxState(false); // Uncheck the checkbox when the list is empty
    }
  };

  // Function to handle changes in text fields by index
  const handleValueChange = (index) => (event) => {
    formStore.setState((state) => {
      const newValues = [...(state.formValues2[fieldName] || [])];
      newValues[index] = event.target.value;

      return {
        formValues2: {
          ...state.formValues2,
          [fieldName]: newValues,
        },
      };
    });
  };

  return (
    <Box display="flex" flexDirection="column">
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

      {/* {checkboxState && (
        <>
          {(formStore.getState().formValues2[fieldName] || []).map(
            (member, index) => (
              <TextField
                key={index}
                size="small"
                value={member}
                onChange={handleValueChange(index)}
                placeholder={`${fieldLabel} ${index + 1}`}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => handleRemoveField(index)}>
                          <RemoveCircle />
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )
          )}

          <Button variant="text" onClick={addNewValueField}>
            Add {fieldLabel}
          </Button>
        </>
      )} */}
    </Box>
  );
};

export default DynamicList;
