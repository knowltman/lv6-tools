import { useState, useEffect } from "react";
import { Box, TextareaAutosize, IconButton } from "@mui/material";
import { RemoveCircle } from "@mui/icons-material";
import { formStore } from "../../stores/formValues";

const DynamicListInline = ({
  fieldName,
  stateName,
  checkboxState,
  setCheckboxState,
  value,
}) => {
  const [localValues, setLocalValues] = useState([]);
  const [showDelete, setShowDelete] = useState(false);
  const { updateFormValue } = formStore();
  const [keys, setKeys] = useState([]);

  //console.log(localValues);

  const generateUniqueId = () => `id-${Date.now()}-${Math.random()}`;

  useEffect(() => {
    if (!value || value.length === 0) {
      handleAddField();
    } else {
      setLocalValues(value);
      setKeys(value.map(() => generateUniqueId())); // Generate stable keys
    }
  }, [value]);

  const handleBlur = () => {
    updateFormValue(stateName, localValues);
  };

  const handleValueChange = (index, newValue) => {
    setLocalValues((prevValues) => {
      const updatedValues = [...prevValues];
      updatedValues[index] = newValue;
      return updatedValues;
    });
  };

  const handleAddField = () => {
    setLocalValues((prevValues) => [...prevValues, ""]);
    setKeys((prevKeys) => [...prevKeys, generateUniqueId()]); // Add a new stable key
  };

  const handleRemoveField = (index) => {
    setLocalValues((prevValues) => {
      const updatedValues = [...prevValues];
      updatedValues.splice(index, 1);

      if (updatedValues.length === 0) setCheckboxState(false);

      updateFormValue(stateName, updatedValues); // Update form value after state update

      return updatedValues;
    });

    setKeys((prevKeys) => {
      const updatedKeys = [...prevKeys];
      updatedKeys.splice(index, 1);
      return updatedKeys;
    });
  };

  return (
    <>
      {checkboxState &&
        localValues.map((val, index) => (
          <div
            key={keys[index]}
            style={{ position: "relative" }}
            onMouseEnter={() => setShowDelete(true)}
            onMouseLeave={() => setShowDelete(false)}
          >
            <TextareaAutosize
              autoFocus
              className="announcement-textarea"
              style={{
                backgroundColor: "white",
                fontFamily: "inherit",
                fontWeight: "bold",
                color: "black",
                fontSize: ".8rem",
                border: "none",
                resize: "none",
                outline: "none",
                width: "100%",
                padding: "0",
                lineHeight: "1.4",
                transition: "background-color 0.3s ease",
              }}
              onBlur={handleBlur}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#f0f0f0";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "white";
              }}
              value={val}
              onChange={(e) => handleValueChange(index, e.target.value)}
              placeholder={`${fieldName} ${index + 1}`}
            />
            <div className="print-text" style={{ display: "none" }}>
              {val}
            </div>
            {showDelete && (
              <IconButton
                onClick={() => handleRemoveField(index)}
                size="small"
                style={{ position: "absolute", top: "-7px", right: "-5px" }}
              >
                <RemoveCircle style={{ width: "18px" }} />
              </IconButton>
            )}
          </div>
        ))}
    </>
  );
};

export default DynamicListInline;
