import {
  Autocomplete,
  TextField,
  createFilterOptions,
  Chip,
} from "@mui/material";
import { useCallback, useState } from "react";

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
    onAddMember, // <-- new prop
  } = props;

  const handleChange = useCallback((field) => (event, newValue) => {
    // Detect "Add member" option
    if (newValue && newValue.inputValue) {
      if (props.onAddMember) {
        props.onAddMember(newValue.inputValue);
      }
      // Optionally clear selection or do nothing
      return;
    }
    if (!newValue) {
      setFormValues((prev) => ({
        ...prev,
        [field]: { first_name: "", last_name: "" },
      }));
    } else if (typeof newValue === "string") {
      // Do not set string, set empty member object instead
      setFormValues((prev) => ({
        ...prev,
        [field]: { first_name: "", last_name: "" },
      }));
    } else {
      // Always set the member object
      setFormValues((prev) => ({
        ...prev,
        [field]: newValue,
      }));
    }
  });

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
      <Autocomplete
        disablePortal
        value={formValues[fieldName]}
        offset={0}
        onChange={handleChange(fieldName)}
        filterOptions={(options, params) => {
          const { inputValue } = params;
          // Custom filter: match inputValue against any part of option text (case-insensitive)
          const filtered = options.filter((option) =>
            parseOptionText(option)
              .toLowerCase()
              .includes(inputValue.toLowerCase())
          );

          // Remove any options with empty strings or invalid values
          const validOptions = filtered.filter(
            (option) => parseOptionText(option).trim() !== ""
          );

          const isExisting = validOptions.some(
            (option) =>
              inputValue.trim().toLowerCase() ===
              parseOptionText(option).toLowerCase()
          );

          // Add "Add member" option if inputValue is not empty and not an existing member
          if (inputValue.trim() !== "" && !isExisting) {
            validOptions.push({
              inputValue,
              title: `Add member "${inputValue}"`,
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
          const uniqueKey =
            option.id || option.inputValue || parseOptionText(option);
          return (
            <li {...props} key={uniqueKey}>
              {option.title ? option.title : parseOptionText(option)}
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
            slotProps={{ inputLabel: { shrink: true } }}
            label={fieldLabel}
          />
        )}
      />
    </>
  );
};

export default ProgramField;
