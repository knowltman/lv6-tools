import React from "react";
import { useDroppable } from "@dnd-kit/core";

const Container = ({ id, children }) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className="bg-white p-4 rounded-lg shadow-md min-h-[200px]"
    >
      {children}
    </div>
  );
};

export default Container;
