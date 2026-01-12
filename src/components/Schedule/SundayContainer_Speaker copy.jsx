import React, { forwardRef } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Card } from "@mui/material";
import { format, parseISO, getDate } from "date-fns";
import DraggableItem_Speaker from "./DraggableItem_Speaker";
import { Add } from "@mui/icons-material";

const SundayContainer_Speaker = ({
  id,
  items,
  sunday,
  setOpen,
  handleAddSpeaker,
  handleAddSpecial,
  specialSundays,
  handleOpenEdit,
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

  const hasSpeakers = items.some((item) => item.date === sunday.date);

  return (
    <Card ref={setNodeRef} className="sunday-card" variant="outlined">
      <div className="card--header">
        <div className="card--title">
          {format(parseISO(sunday.date), "MMMM d")}
        </div>
      </div>
      <div className="card--content">
        <SortableContext
          items={items
            .filter((item) => item.date === sunday.date)
            .sort((a, b) => a.order - b.order)
            .map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {items
            .filter((item) => item.date === sunday.date)
            .sort((a, b) => a.order - b.order)
            .map((item) => (
              <DraggableItem_Speaker
                key={item.id}
                id={item.id}
                name={item.name}
                speaker_id={item.speaker_id}
                subject={item.subject}
                setOpen={setOpen}
                date={item.date}
                handleOpenEdit={handleOpenEdit}
              />
            ))}
        </SortableContext>

        {specialSunday && specialSunday.type !== "Ward Conference" ? (
          <div className="special-sunday-type">
            {specialSunday.description || specialSunday.type}
          </div>
        ) : isConferenceSunday ? (
          <div className="special-sunday-type">General Conference</div>
        ) : isFirstSunday ? (
          <div className="special-sunday-type">Fast Sunday</div>
        ) : (
          <>
            <div
              className="add-item-button"
              onClick={() => handleAddSpeaker(sunday.date)}
            >
              <Add fontSize="small" />
              add speaker
            </div>

            {!hasSpeakers && !specialSunday && !isFirstSunday && (
              <div
                className="add-item-button"
                onClick={() => handleAddSpecial(sunday.date)}
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
};

export default SundayContainer_Speaker;
