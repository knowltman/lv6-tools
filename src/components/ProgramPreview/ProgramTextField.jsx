import { TextField } from "@mui/material";

const ProgramTextField = (props) => {
  const { value, placeholder, setFormValues, fieldName } = props;

  const updateValue = (e) => {
    console.log(e);
    const newValue = e.target.value;
    setFormValues((prevValues) => ({
      ...prevValues,
      [fieldName]: newValue,
    }));
  };

  return (
    <TextField value={value} onChange={updateValue} placeholder={placeholder} />
  );
};

export default ProgramTextField;
