import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { DragIndicator, Add, Delete } from "@mui/icons-material";

const DraggableItem_Music = ({
  id,
  name,
  performer,
  type,
  number,
  date,
  handleDeleteMusic,
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const isWardChoir = performer === "Ward Choir";

  const isDraggingStyle = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: 0.5,
      }
    : undefined;

  const containerStyle = {
    display: "flex",
    alignItems: "center",
    borderRadius: "4px",
    fontSize: ".9rem",
    cursor: "move",
    padding: ".2rem",
    border: "1px solid #c69bff",
  };

  const contentStyle = {
    marginTop: ".2rem",
    display: "flex",
    flexDirection: "column",
  };

  const nameStyle = {
    fontWeight: 600,
  };

  const WC_nameStyle = {
    fontWeight: 600,
    color: "#fff",
  };

  const typeStyle = {
    textTransform: "capitalize",
  };

  const bgColor = "#efe3ff";
  const svgColor = "#c69bff";
  const typeColor = "#7e43cf";

  const WC_svgColor = "#c69bff";
  const WC_typeColor = "#e5d1ff";
  const WC_bgColor = "#b681ff";

  const person = (
    <div
      ref={setNodeRef}
      className="music-container"
      style={{
        backgroundColor: isWardChoir ? WC_bgColor : bgColor,
        ...containerStyle,
        ...isDraggingStyle,
      }}
    >
      <div
        {...attributes}
        {...listeners} // Only apply drag listeners here
        style={{ cursor: "move", display: "flex", alignItems: "center" }}
      >
        <DragIndicator
          fontSize="small"
          style={{ color: isWardChoir ? WC_svgColor : svgColor }}
        />
      </div>

      {/* Content */}
      <div style={contentStyle}>
        <span style={isWardChoir ? WC_nameStyle : nameStyle}>{name}</span>
        <i
          style={{
            color: isWardChoir ? WC_typeColor : typeColor,
            ...typeStyle,
          }}
        >{`${type} (${performer})`}</i>
      </div>

      {/* Delete Button */}
      <Delete
        fontSize="small"
        style={{
          color: isWardChoir ? WC_svgColor : svgColor,
          cursor: "pointer",
        }}
        className={"edit-button"}
        onClick={() =>
          handleDeleteMusic({
            id: id,
          })
        }
      />
    </div>
  );
  return person;
};

export default DraggableItem_Music;
