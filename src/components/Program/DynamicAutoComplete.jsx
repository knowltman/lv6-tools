import { useEffect } from "react";
import { Box, FormControlLabel, Checkbox } from "@mui/material";
import ProgramField from "../ProgramPreview/ProgramField";

const DynamicAutoComplete = (props) => {
  const {
    formValues,
    setFormValues,
    checkboxState,
    setCheckboxState,
    checkboxLabel,
    members,
  } = props;

  useEffect(() => {
    if (checkboxState === false) {
      // Set all speakers (1-4) to empty objects
      setFormValues((prev) => ({
        ...prev,
        speaker_1: { first_name: "", last_name: "" },
        speaker_2: { first_name: "", last_name: "" },
        speaker_3: { first_name: "", last_name: "" },
        // speaker_4: { first_name: "", last_name: "" },
      }));
    }
  }, [checkboxState, setFormValues]);

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

      {checkboxState && (
        <div style={{ marginTop: "1rem" }}>
          <ProgramField
            key={"speaker_1"}
            formValues={formValues}
            setFormValues={setFormValues}
            options={members}
            fieldName={"speaker_1"}
            fieldLabel={"Speaker 1"}
            optionText={"first_name last_name"}
          />
          <ProgramField
            key={"speaker_2"}
            formValues={formValues}
            setFormValues={setFormValues}
            options={members}
            fieldName={"speaker_2"}
            fieldLabel={"Speaker 2"}
            optionText={"first_name last_name"}
          />
          <ProgramField
            key={"speaker_3"}
            formValues={formValues}
            setFormValues={setFormValues}
            options={members}
            fieldName={"speaker_3"}
            fieldLabel={"Speaker 3"}
            optionText={"first_name last_name"}
          />
          {/* <ProgramField
            key={"speaker_4"}
            formValues={formValues}
            setFormValues={setFormValues}
            options={members}
            fieldName={"speaker_4"}
            fieldLabel={"Speaker 4"}
            optionText={"first_name last_name"}
          /> */}
        </div>
      )}
    </Box>
  );
};
export default DynamicAutoComplete;
