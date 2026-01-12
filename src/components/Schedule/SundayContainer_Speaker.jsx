import { useDroppable } from "@dnd-kit/core";
import { Card } from "@mui/material";
import { format, parseISO, getDate } from "date-fns"; // Added getDate import
import Add from "@mui/icons-material/Add";
import React from "react";

// Accept props for add speaker/special logic and specialSundays
export default function SundayContainer_Speaker({
  date,
  children,
  handleAddSpeaker,
  handleAddSpecial,
  handleAddEvent,
  speakers = [],
  specialSundays = [],
}) {
  const { setNodeRef, isOver } = useDroppable({ id: date });

  const hasSpeakers = speakers.length > 0;
  const specialSunday = specialSundays?.find((s) => s.date === date);
  const parsedDate = parseISO(date);
  const isFirstSunday = getDate(parsedDate) <= 7 && parsedDate.getDay() === 0;

  const isConferenceSunday =
    getDate(parsedDate) <= 7 &&
    parsedDate.getDay() === 0 &&
    (parsedDate.getMonth() === 3 || parsedDate.getMonth() === 9);

  const childrenCount = React.Children.count(children);

  return (
    <Card
      ref={setNodeRef}
      className={"sunday-card"}
      variant="outlined"
      style={{
        background: isOver ? "#ddefff" : "#fff",
        transition: "background 0.2s",
      }}
    >
      <div className="card--header">
        <div className="card--title">{format(parsedDate, "MMMM d")}</div>
      </div>
      <div
        className={`${"card--content"} ${
          isFirstSunday || specialSunday ? "special-sunday" : ""
        }`}
      >
        {specialSunday && specialSunday.type !== "Ward Conference" ? (
          <div className="special-sunday-type">
            {specialSunday.description || specialSunday.type}
          </div>
        ) : isConferenceSunday ? (
          <div className="special-sunday-type">General Conference</div>
        ) : isFirstSunday ? (
          <>
            <div className="special-sunday-type">Fast Sunday</div>
            {children}

            <div
              className="add-item-button"
              onClick={() => handleAddEvent(date)}
            >
              <Add fontSize="small" />
              add special event
            </div>
          </>
        ) : (
          <>
            {children}
            <div
              className="add-item-button"
              onClick={() => handleAddEvent(date)}
            >
              <Add fontSize="small" />
              add special event
            </div>
            <div
              className="add-item-button"
              onClick={() => handleAddSpeaker(date)}
            >
              <Add fontSize="small" />
              add speaker
            </div>
            {!hasSpeakers && !specialSunday && childrenCount === 0 && (
              <div
                className="add-item-button"
                onClick={() => handleAddSpecial(date)}
              >
                <Add fontSize="small" />
                add special sunday
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
