import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Delete, DragIndicator, Edit } from "@mui/icons-material";

const DraggableItem_Speaker = (props) => {
  const { id, name, subject, speaker_id, handleOpenEdit, handleDeleteSpeaker } =
    props;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    display: "flex",
    alignItems: "center",
    borderRadius: "4px",
    fontSize: ".9rem",
    cursor: "move",
    padding: ".2rem",
    border: "1px solid #f9c399",
    backgroundColor: "#fbefd8",
    opacity: isDragging ? 0.5 : 1,
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const contentStyle = {
    marginTop: ".2rem",
    display: "flex",
    flexDirection: "column",
    flex: 1,
  };

  const nameStyle = {
    fontWeight: 600,
  };

  const typeStyle = {
    textTransform: "capitalize",
  };

  const svgColor = "#f9c399";
  const typeColor = "#cb8525";

  return (
    <div ref={setNodeRef} className="speaker-container" style={style}>
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        style={{ cursor: "move", display: "flex", alignItems: "center" }}
      >
        <DragIndicator fontSize="small" style={{ color: svgColor }} />
      </div>

      {/* Content */}
      <div style={contentStyle}>
        {name !== "Program Event" && <span style={nameStyle}>{name}</span>}
        <i style={{ color: typeColor, ...typeStyle }}>{subject}</i>
      </div>

      {/* Action Buttons */}
      <div>
        <Edit
          fontSize="small"
          style={{ color: svgColor, cursor: "pointer" }}
          className={"edit-button"}
          onClick={() =>
            handleOpenEdit({
              id: id,
              name: name,
              subject: subject,
              speaker_id: speaker_id,
            })
          }
        />
        <Delete
          fontSize="small"
          style={{ color: svgColor, cursor: "pointer" }}
          className={"delete-button"}
          onClick={() =>
            handleDeleteSpeaker({
              id: id,
            })
          }
        />
      </div>
    </div>
  );
};

export default DraggableItem_Speaker;
