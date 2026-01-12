import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { DragIndicator, Add, Delete } from "@mui/icons-material";
import { prayersStore } from "../../stores/prayers";

const contentStyle = {
  marginTop: ".2rem",
  display: "flex",
  flexDirection: "column",
};

const nameStyle = {
  fontWeight: 600,
};

const typeStyle = {
  textTransform: "capitalize",
};

const DraggableItem = ({
  id,
  name,
  type,
  date,
  handleAddPrayer,
  dragComplete,
  fetchPrayers,
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  const { deletePrayer } = prayersStore();

  const isDraggingStyle = transform
    ? {
        //transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: 0.5,
      }
    : undefined;

  const bgColor = type === "invocation" ? "#d8e9fb" : "#CCF1D7";
  const svgColor = type === "invocation" ? "#99cbf9" : "#84d3af";
  const typeColor = type === "invocation" ? "#376ea4" : "#376A5C";

  const containerStyle = {
    display: "flex",
    alignItems: "center",
    borderRadius: "4px",
    fontSize: ".9rem",
    cursor: "move",
    padding: ".2rem",
    border: `1px solid ${svgColor}`,
  };

  const person =
    !id && !name ? (
      <div
        className="add-item-button"
        onClick={() => handleAddPrayer(type, date)}
      >
        <Add fontSize="small" />
        add {type}
      </div>
    ) : (
      <div
        ref={setNodeRef}
        className="prayer-container"
        style={{
          backgroundColor: bgColor,
          ...containerStyle,
          ...isDraggingStyle,
        }}
      >
        <div {...attributes} {...listeners}>
          <DragIndicator fontSize="small" style={{ color: svgColor }} />
        </div>

        {/* Content */}
        <div style={contentStyle}>
          <span style={nameStyle}>{name}</span>
          <i style={{ color: typeColor, ...typeStyle }}>{type}</i>
        </div>

        {/* Delete Button */}
        <Delete
          fontSize="small"
          style={{ color: svgColor, cursor: "pointer" }}
          className={"edit-button"}
          onClick={() => deletePrayer(id, date)}
        />
      </div>
    );
  return person;
};

export default DraggableItem;
