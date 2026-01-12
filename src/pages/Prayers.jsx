import React, { useState, useEffect, useRef } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import SundayContainer from "../components/Schedule/SundayContainer";
import DraggableItem from "../components/Schedule/DraggableItem";
import axios from "axios";
import {
  mapToSundaysFormat,
  groupSundaysByMonth,
  getCurrentMonth,
} from "./SchedulePage.logic";
import AddPrayerPopup from "../components/Popups/AddPrayerPopup";
import LoadingOverlay from "../components/LoadingOverlay/LoadingOverlay";
import { membersStore } from "../stores/members";
import { programStore } from "../stores/program";
import { formStore } from "../stores/formValues";
import { prayersStore } from "../stores/prayers";

const excludedTypes = [
  "Primary Program",
  "Christmas Program",
  "Ward Conference",
];

const apiURL = import.meta.env.VITE_API_URL;

const Prayers = (props) => {
  const { prayerHistory2, getPrayerHistory2, addPrayer } = prayersStore();
  const members = membersStore((state) => state.members);
  const specialSundays = programStore((state) => state.specialSundays);

  const [items, setItems] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [scheduledPrayer, setScheduledPrayer] = useState({
    speaker_id: undefined,
    date: undefined,
    type: undefined,
  });
  const [selectedMember, setSelectedMember] = useState({ member: "" });
  const [sundaysJson, setSundaysJson] = useState({ sundays: [] });
  const [dragComplete, setDragComplete] = useState(false);

  const filteredSpecialSundays =
    specialSundays &&
    specialSundays.filter((sunday) => !excludedTypes.includes(sunday.type));

  const currentMonth = getCurrentMonth();
  const currentMonthRef = useRef(null);

  // useEffect(() => {
  //   if (
  //     prayerSchedule &&
  //     Array.isArray(prayerSchedule) &&
  //     prayerSchedule.length > 0
  //   ) {
  //     const currentYear = new Date().getFullYear();
  //     const years = Array.from(
  //       { length: currentYear - 2023 + 2 },
  //       (_, i) => 2024 + i
  //     );

  //     const allMappedSundays = years.flatMap((year) =>
  //       mapToSundaysFormat(prayerSchedule, year)
  //     );

  //     setSundaysJson({ sundays: allMappedSundays });

  //     const initialItems = allMappedSundays.flatMap((sunday) => [
  //       {
  //         id: sunday.invocation.id,
  //         name: sunday.invocation.name,
  //         date: sunday.date,
  //         type: "invocation",
  //       },
  //       {
  //         id: sunday.benediction.id,
  //         name: sunday.benediction.name,
  //         date: sunday.date,
  //         type: "benediction",
  //       },
  //     ]);

  //     setItems(initialItems);
  //     setIsLoading(false);
  //   }
  // }, [prayerSchedule]);

  useEffect(() => {
    if (
      prayerHistory2 &&
      Array.isArray(prayerHistory2) &&
      prayerHistory2.length > 0
    ) {
      const currentYear = new Date().getFullYear();
      const years = Array.from(
        { length: currentYear - 2023 + 2 },
        (_, i) => 2024 + i
      );

      const allMappedSundays = years.flatMap((year) =>
        mapToSundaysFormat(prayerHistory2, year)
      );

      setSundaysJson({ sundays: allMappedSundays });

      const initialItems = allMappedSundays.flatMap((sunday) => [
        {
          id: sunday.invocation.id,
          name: sunday.invocation.name,
          date: sunday.date,
          type: "invocation",
        },
        {
          id: sunday.benediction.id,
          name: sunday.benediction.name,
          date: sunday.date,
          type: "benediction",
        },
      ]);

      setItems(initialItems);
      setIsLoading(false);
    }
  }, [prayerHistory2]);

  useEffect(() => {
    if (!isLoading && currentMonthRef.current) {
      currentMonthRef.current.scrollIntoView({
        block: "start",
      });
    }
  }, [currentMonth, isLoading]);

  const activeItem = activeId
    ? items.find((item) => item.id === activeId)
    : null;

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
    setDragComplete(false);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newItem = { ...items[oldIndex], date: over.id };

        // Optimistically update the state
        const updatedItems = [
          ...items.slice(0, oldIndex),
          ...items.slice(oldIndex + 1),
          newItem,
        ].sort((a, b) => (a.type === "invocation" ? -1 : 1));

        // Save updated date to backend after state is updated
        saveUpdatedDate(newItem, oldIndex, items);
        setDragComplete(true);
        return updatedItems;
      });
    }
  };

  // Function to save the updated date to the backend
  const saveUpdatedDate = async (updatedItem, oldIndex, prevItems) => {
    try {
      const response = await axios.put(
        `${apiURL}/api/prayer/${updatedItem.id}`,
        {
          date: updatedItem.date,
        }
      );

      if (response.status === 200) {
        setSundaysJson((prev) => {
          const updatedSundays = prev.sundays.map((sunday) => {
            // Find the Sunday where the prayer was originally
            if (sunday.date === prevItems[oldIndex].date) {
              // Remove the item from the old Sunday
              if (prevItems[oldIndex].type === "invocation") {
                return {
                  ...sunday,
                  invocation: {}, // Remove the invocation
                };
              } else if (prevItems[oldIndex].type === "benediction") {
                return {
                  ...sunday,
                  benediction: {}, // Remove the benediction
                };
              }
            }

            // Find the new Sunday and add the updated item
            if (sunday.date === updatedItem.date) {
              if (updatedItem.type === "invocation") {
                return {
                  ...sunday,
                  invocation: {
                    id: updatedItem.id,
                    name: updatedItem.name,
                  },
                };
              } else if (updatedItem.type === "benediction") {
                return {
                  ...sunday,
                  benediction: {
                    id: updatedItem.id,
                    name: updatedItem.name,
                  },
                };
              }
            }

            return sunday; // No changes for other Sundays
          });
          return { ...prev, sundays: updatedSundays };
        });
      } else {
        // Revert state if the update fails
        setItems(prevItems);
      }
    } catch (e) {
      console.error("Failed to update prayer date", e);
      // Revert state if the update fails
      setItems(prevItems);
    }
  };

  const handleSwap = (date) => {
    setItems((items) => {
      const sundayItems = items.filter((item) => item.date === date);
      if (sundayItems.length !== 2) return items;

      const [item1, item2] = sundayItems;
      const updatedItems = items.map((item) => {
        if (item.date === date) {
          if (item.id === item1.id) return { ...item, type: item2.type };
          if (item.id === item2.id) return { ...item, type: item1.type };
        }
        return item;
      });

      return updatedItems.sort((a, b) => (a.type === "invocation" ? -1 : 1));
    });
  };

  const handleAddPrayer = (type, date) => {
    setOpen(true);
    setScheduledPrayer((prev) => ({
      ...prev,
      date: date,
      type: type,
    }));
  };

  const handleSavePrayer = async () => {
    if (selectedMember.member) {
      const updatedState = {
        ...scheduledPrayer,
        speaker_id: selectedMember.member.id,
        speaker_name: `${selectedMember.member.first_name} ${selectedMember.member.last_name}`, // Add this line to pass the speaker's name
      };

      setScheduledPrayer(updatedState);

      try {
        addPrayer(updatedState, scheduledPrayer.type);
        setSelectedMember({ member: "" });
        setOpen(false);
      } catch (e) {
        console.error("Failed to save prayer", e);
      }
    }
  };

  const handleClose = () => {
    setSelectedMember({ member: "" });
    setOpen(false);
  };

  const groupedSundays = groupSundaysByMonth(sundaysJson.sundays);

  return (
    <div className="container" style={{ overflowY: "auto", height: "92vh" }}>
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="scheduling-container">
          {groupedSundays.map(([month, sundays]) => (
            <div
              key={month}
              ref={month === currentMonth ? currentMonthRef : null}
            >
              <h3>{month}</h3>
              <div className="month-row">
                {sundays.map((sunday) => (
                  <SundayContainer
                    key={sunday.date}
                    id={sunday.date}
                    onSwap={() => handleSwap(sunday.date)}
                    items={items}
                    sunday={sunday}
                    setOpen={setOpen}
                    handleAddPrayer={handleAddPrayer}
                    dragComplete={dragComplete}
                    setDragComplete={setDragComplete}
                    fetchPrayers={getPrayerHistory2}
                    specialSundays={filteredSpecialSundays}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <DragOverlay>
          {activeItem && (
            <DraggableItem
              id={activeItem.id}
              name={activeItem.name}
              type={activeItem.type}
            />
          )}
        </DragOverlay>
      </DndContext>
      <AddPrayerPopup
        open={open}
        handleClose={handleClose}
        handleSavePrayer={handleSavePrayer}
        scheduledPrayer={scheduledPrayer}
        selectedMember={selectedMember}
        setSelectedMember={setSelectedMember}
        members={members}
      />
      {/* <LoadingOverlay isLoading={isLoading} /> */}
    </div>
  );
};

export default Prayers;
