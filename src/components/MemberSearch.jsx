import { useState } from "react";
import { Chip, Autocomplete, TextField } from "@mui/material";
import { uiStore } from "../stores/uiStore";
import { membersStore } from "../stores/members";

export const MemberSearch = () => {
  const { members, fetchMemberData } = membersStore((state) => state);

  const [value, setValue] = useState(null);
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
  };

  const handleMemberSelectionChange = (event, newValue) => {
    setValue(newValue);
    if (!newValue) return;
    fetchMemberData(newValue.id);
    uiStore.getState().setSidebarOpen(true);
    setInputValue("");
    setValue(null);
  };

  return (
    <Autocomplete
      freeSolo
      size="small"
      id="search"
      fullWidth
      options={members}
      getOptionLabel={(option) => {
        if (typeof option === "string") {
          return option;
        }
        return `${option.first_name || ""} ${option.last_name || ""}`;
      }}
      value={value} // Make sure value is initialized as null
      inputValue={inputValue}
      onChange={handleMemberSelectionChange}
      onInputChange={handleInputChange}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Member Search..."
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#f0f0f0",
              "& fieldset": {
                borderColor: "#f0f0f0", // Default border color
              },
              "&:hover fieldset": {
                borderColor: "#0000001f", // Border color on hover
              },
              "&.Mui-focused fieldset": {
                borderColor: "#0000001f", // Border color when focused
              },
            },
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          {`${option.first_name || ""} ${option.last_name || ""}`}
          {option.isYouth && (
            <Chip
              style={{ marginLeft: "auto" }}
              color="primary"
              label="Youth"
              size="small"
            />
          )}
          {option.active === 0 && (
            <Chip
              style={{ marginLeft: "auto" }}
              color="error"
              label="Not Active"
              size="small"
            />
          )}
        </li>
      )}
    />
  );
};
export default MemberSearch;
