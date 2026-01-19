import React, { useState } from "react";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
} from "@mui/material";
import { format, parseISO, addWeeks } from "date-fns";
import { getNextSunday } from "../../pages/Dashboard.logic";
import { programStore } from "../../stores/program";
import { musicStore } from "../../stores/music";
import { prayersStore } from "../../stores/prayers";

const ProgramDateSelect = () => {
  const { programsList, getProgramData } = programStore();
  const { getMusicHistory2 } = musicStore();
  const { getSundayPrayers, prayerHistory2, sundayPrayers } = prayersStore();

  const nextSunday = format(getNextSunday(), "yyyy-MM-dd");
  const followingSunday = format(
    addWeeks(parseISO(nextSunday), 1),
    "yyyy-MM-dd",
  );

  const hasAnEntry = programsList.some(
    (program) => program.date === nextSunday,
  );
  const [selectedProgram, setSelectedProgram] = useState(
    hasAnEntry ? nextSunday : nextSunday,
  );

  const handleChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedProgram(selectedValue);
    getProgramData(selectedValue);
    getMusicHistory2(selectedValue);
    getSundayPrayers(selectedValue);
  };

  // Create a combined list with next Sunday and following Sunday at the top
  const futurePrograms = [
    { date: nextSunday, isFuture: true },
    { date: followingSunday, isFuture: true },
  ];

  // Filter out any existing programs that match the future dates
  const pastPrograms = programsList.filter(
    (program) =>
      program.date !== nextSunday && program.date !== followingSunday,
  );

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
        {futurePrograms.map((program) => (
          <MenuItem key={program.date} value={program.date}>
            {format(parseISO(program.date), "MMMM d, yyyy")}
          </MenuItem>
        ))}
        {pastPrograms.length > 0 && <Divider />}
        {pastPrograms.map((program) => (
          <MenuItem key={program.id} value={program.date}>
            {format(parseISO(program.date), "MMMM d, yyyy")}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default ProgramDateSelect;
