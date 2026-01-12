import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SwapVert } from "@mui/icons-material";
import { Card, IconButton } from "@mui/material";
import { format, parseISO, getDate } from "date-fns";
import DraggableItem from "./DraggableItem";

const SundayContainer = ({
  id,
  items,
  onSwap,
  sunday,
  setOpen,
  handleAddPrayer,
  dragComplete,
  fetchPrayers,
  specialSundays,
}) => {
  const { setNodeRef } = useDroppable({ id });

  const specialSunday = specialSundays.find(
    (special) => special.date === sunday.date
  );
  const isFirstSunday =
    getDate(parseISO(sunday.date)) <= 7 && parseISO(sunday.date).getDay() === 0;

  const isConferenceSunday =
    getDate(parseISO(sunday.date)) <= 7 &&
    parseISO(sunday.date).getDay() === 0 &&
    (parseISO(sunday.date).getMonth() === 3 ||
      parseISO(sunday.date).getMonth() === 9);

  return (
    <Card ref={setNodeRef} className="sunday-card" variant="outlined">
      <div className="card--header">
        <div className="card--title">
          {format(parseISO(sunday.date), "MMMM d")}
        </div>
        <IconButton
          size="small"
          onClick={onSwap}
          aria-label="Swap invocation and benediction"
        >
          <SwapVert fontSize="small" />
        </IconButton>
      </div>
      <div
        className={`card--content ${
          isConferenceSunday ||
          (specialSunday &&
            !["Other", "Fast Sunday"].includes(specialSunday.type))
            ? "special-sunday"
            : ""
        }`}
      >
        {specialSunday &&
        specialSunday.type &&
        !["Other", "Fast Sunday"].includes(specialSunday.type) ? (
          <div className="special-sunday-type">
            {specialSunday.description || specialSunday.type}
          </div>
        ) : isConferenceSunday ? (
          <div className="special-sunday-type">General Conference</div>
        ) : (
          items
            .filter((item) => item.date === sunday.date)
            .sort((a, b) => (a.type === "invocation" ? -1 : 1))
            .map((item, index) => (
              <DraggableItem
                key={index}
                id={item.id}
                name={item.name}
                type={item.type}
                setOpen={setOpen}
                handleAddPrayer={handleAddPrayer}
                date={item.date}
                dragComplete={dragComplete}
                fetchPrayers={fetchPrayers}
                specialSundays={specialSundays}
              />
            ))
        )}
      </div>
    </Card>
  );
};

export default SundayContainer;
