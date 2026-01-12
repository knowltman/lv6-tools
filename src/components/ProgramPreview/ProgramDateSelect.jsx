import React, { useState } from "react";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
} from "@mui/material";
import { format, parseISO } from "date-fns";
import { getNextSunday } from "../../pages/Dashboard.logic";
import { programStore } from "../../stores/program";
import { musicStore } from "../../stores/music";
import { prayersStore } from "../../stores/prayers";

const ProgramDateSelect = () => {
  const { programsList, getProgramData } = programStore();
  const { getMusicHistory2 } = musicStore();
  const { getSundayPrayers, prayerHistory2, sundayPrayers } = prayersStore();

  const nextSunday = format(getNextSunday(), "yyyy-MM-dd");
  const hasAnEntry = programsList.some(
    (program) => program.date === nextSunday
  );
  const [selectedProgram, setSelectedProgram] = useState(
    hasAnEntry ? nextSunday : nextSunday
  );

  const handleChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedProgram(selectedValue);
    getProgramData(selectedValue);
    getMusicHistory2(selectedValue);
    getSundayPrayers(selectedValue);
  };

  return (
    <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
      <InputLabel id="program-date-label">Program Date</InputLabel>
      <Select
        labelId="program-date-label"
        value={selectedProgram}
        onChange={handleChange}
        size="small"
        label="Program Date"
        defaultChecked={selectedProgram}
      >
        {programsList.map((program) => (
          <MenuItem key={program.id} value={program.date}>
            {format(parseISO(program.date), "MMMM, d, yyyy")}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default ProgramDateSelect;
