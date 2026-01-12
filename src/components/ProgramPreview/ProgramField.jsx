import {
  Autocomplete,
  TextField,
  createFilterOptions,
  Chip,
} from "@mui/material";
import { useCallback, useState } from "react";
import { formStore } from "../../stores/formValues";

const filter = createFilterOptions();

const ProgramField = (props) => {
  const {
    formValues,
    setFormValues,
    options,
    fieldName,
    fieldLabel,
    optionText,
    autoFocus = false,
    disabled = false,
    fullWidth = false,
    small = false,
  } = props;

  //const [choirText, setChoirText] = useState(""); // State for Ward Choir input

  const handleChange = useCallback(
    (field) => (event, newValue) => {
      if (!newValue) {
        formStore
          .getState()
          .updateFormValue(field, { first_name: "", last_name: "" });
      } else if (typeof newValue === "string") {
        formStore.getState().updateFormValue(field, newValue);
      } else if (newValue?.inputValue) {
        formStore.getState().updateFormValue(field, newValue.inputValue);
      } else {
        formStore.getState().updateFormValue(field, newValue);
      }
    },
    []
  );

  const parseOptionText = useCallback((option) => {
    const parts = optionText.split(" ");

    if (parts.length === 2) {
      const firstPart = option[parts[0]] ?? ""; // Fallback to empty string if undefined
      const secondPart = option[parts[1]] ?? ""; // Fallback to empty string if undefined

      if (typeof firstPart === "number") {
        return `${firstPart}. ${secondPart}`;
      } else {
        return `${firstPart} ${secondPart}`;
      }
    }

    // Handle case where there's only one part
    return option[parts[0]] ?? ""; // Fallback to empty string if undefined
  });

  return (
    <>
      {/* {console.log(fieldName)}
      {console.log(formValues[fieldName])} */}
      <Autocomplete
        disablePortal
        value={formValues[fieldName]}
        offset={0}
        fullWidth={fullWidth}
        onChange={handleChange(fieldName)}
        filterOptions={(options, params) => {
          const filtered = filter(options, params);
          const { inputValue } = params;

          // Remove any options with empty strings or invalid values
          const validOptions = filtered.filter(
            (option) => parseOptionText(option).trim() !== ""
          );

          const isExisting = validOptions.some(
            (option) => inputValue === parseOptionText(option)
          );

          if (inputValue !== "" && !isExisting) {
            validOptions.push({
              inputValue,
              title: `Add "${inputValue}"`,
            });
          }

          return validOptions;
        }}
        selectOnFocus
        clearOnBlur
        autoFocus={autoFocus}
        handleHomeEndKeys
        id={fieldLabel}
        label={fieldLabel}
        disabled={disabled}
        options={options}
        getOptionLabel={(option) => parseOptionText(option)}
        renderOption={(props, option) => {
          const uniqueKey = option.id;
          return (
            <li {...props} key={uniqueKey}>
              {parseOptionText(option)}
              {option.isYouth && (
                <Chip
                  style={{ marginLeft: "auto" }}
                  color="primary"
                  label="Youth"
                  size="small"
                />
              )}
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            size={small ? "small" : "regular"}
            slotProps={{ inputLabel: { shrink: true } }}
            label={fieldLabel}
          />
        )}
      />
    </>
  );
};

export default ProgramField;
