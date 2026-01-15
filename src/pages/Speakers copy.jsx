import React, { useState, useEffect, useRef } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import SundayContainer_Speaker from "../components/Schedule/SundayContainer_Speaker";
import DraggableItem_Speaker from "../components/Schedule/DraggableItem_Speaker";
import axios from "axios";
import {
  mapToSundaysSpeakerFormat,
  groupSundaysByMonth,
  getCurrentMonth,
} from "./SchedulePage.logic";
import AddSpecialPopup from "../components/Popups/AddSpecialPopup";
import AddSpeakerPopup from "../components/Popups/AddSpeakerPopup";
import EditSpeakerPopup from "../components/Popups/EditSpeakerPopup";
import { membersStore } from "../stores/members";
import { programStore } from "../stores/program";
import { speakersStore } from "../stores/speakers";

const defaultScheduledSpeaker = {
  speaker_id: undefined,
  date: undefined,
  subject: "",
  order: undefined,
};

const defaultSpecialSunday = {
  date: undefined,
  type: "",
  description: "",
};

const Speakers = () => {
  const { members } = membersStore();
  const { specialSundays, setSpecialSundays } = programStore();
  const { speakerHistory2, getSpeakerHistory2 } = speakersStore();

  const [items, setItems] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openSpecial, setOpenSpecial] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [scheduledSpeaker, setScheduledSpeaker] = useState(
    defaultScheduledSpeaker
  );
  const [specialSunday, setSpecialSunday] = useState(defaultSpecialSunday);
  const [selectedMember, setSelectedMember] = useState({ member: "" });
  const [sundaysJson, setSundaysJson] = useState({ sundays: [] });

  const currentMonth = getCurrentMonth();
  const currentMonthRef = useRef(null);

  useEffect(() => {
    if (
      speakerHistory2 &&
      Array.isArray(speakerHistory2) &&
      speakerHistory2.length > 0
    ) {
      const currentYear = new Date().getFullYear();
      const years = Array.from(
        { length: currentYear - 2023 + 2 },
        (_, i) => 2024 + i
      );

      const allMappedSundays = years.flatMap((year) =>
        mapToSundaysSpeakerFormat(speakerHistory2, year)
      );

      setSundaysJson({ sundays: allMappedSundays });

      const initialItems = allMappedSundays.flatMap((sunday) =>
        sunday.speakers
          .filter((speaker) => speaker) // Filter out empty slots
          .map((speaker, index) => ({
            id: speaker.id,
            name: speaker.name,
            date: sunday.date,
            speaker_id: speaker.speaker_id,
            order: speaker.order, // Order corresponds to the index + 1
            subject: speaker.subject || "TBD",
          }))
      );
      setItems(initialItems);
      setIsLoading(false);
    }
  }, [speakerHistory2]);

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
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const oldItem = items[oldIndex];
        const newItem = { ...oldItem, date: over.id }; // Update date when item is dragged

        // Remove the active item from the old position and insert it into the new list
        const updatedItems = [
          ...items.slice(0, oldIndex),
          ...items.slice(oldIndex + 1),
          newItem,
        ];

        // Filter for items on the new Sunday (date) and update their order
        const sundayItems = updatedItems.filter(
          (item) => item.date === newItem.date
        );

        const changedItems = [];

        // Recalculate the order for the items on the new Sunday
        sundayItems.forEach((item, index) => {
          const newOrder = index + 1; // New order
          if (item.order !== newOrder || oldItem.date !== over.id) {
            // Check if order or date has changed
            item.order = newOrder;
            changedItems.push({ ...item, order: newOrder, date: over.id }); // Push item with updated date and order
          }
        });

        if (changedItems.length > 0) {
          saveUpdatedDate(changedItems); // Pass the array of changed items to the backend
        }

        return updatedItems;
      });
    }
  };

  const saveUpdatedDate = async (updatedItems) => {
    try {
      const updatePromises = updatedItems.map((item) =>
        axios.patch(`/api/speaker/${item.id}`, {
          date: item.date,
          order: item.order,
        })
      );

      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Failed to update speaker date/order", error);
    }
  };

  const handleAddSpeaker = (date) => {
    setOpen(true);
    setScheduledSpeaker((prev) => ({
      ...prev,
      date: date,
    }));
  };

  const handleSaveSpeaker = async () => {
    if (selectedMember.member) {
      const updatedState = {
        ...scheduledSpeaker,
        speaker_id: selectedMember.member.id,
        speaker_name: `${selectedMember.member.first_name} ${selectedMember.member.last_name}`,
        order: scheduledSpeaker.order !== null ? scheduledSpeaker.order : 1,
      };

      setScheduledSpeaker(updatedState);

      try {
        await axios.post(`/api/speaker`, {
          newDates: [updatedState.date],
          speakerId: updatedState.speaker_id,
          order: updatedState.order,
          subject: scheduledSpeaker.subject,
        });

        getSpeakerHistory2();
        setSelectedMember({ member: "" });
        setScheduledSpeaker(defaultScheduledSpeaker);
        setOpen(false);
      } catch (e) {
        console.error("Failed to save speaker", e);
      }
    }
  };

  const handleClose = () => {
    setSelectedMember({ member: "" });
    setScheduledSpeaker(defaultScheduledSpeaker);
    setSpecialSunday(defaultSpecialSunday);
    setOpen(false);
    setOpenEdit(false);
    setOpenSpecial(false);
  };

  const handleOpenEdit = (speaker) => {
    const editingMember = members.find(
      (member) => member.id === speaker.speaker_id
    );
    setSelectedMember({ member: editingMember });
    setScheduledSpeaker(speaker);
    setOpenEdit(true);
  };

  const handleAddSpecial = (date) => {
    setOpenSpecial(true);
    setSpecialSunday((prev) => ({
      ...prev,
      date: date,
    }));
  };

  const handleSaveSpecial = async () => {
    if (specialSunday) {
      const updatedState = [
        ...specialSundays,
        {
          date: specialSunday.date,
          type: specialSunday.type,
          description: specialSunday.description || null,
        },
      ];
      setSpecialSundays(updatedState);
      try {
        await axios.post(`/api/sunday`, {
          date: specialSunday.date,
          type: specialSunday.type,
          description: specialSunday.description,
        });
        setSpecialSunday(defaultSpecialSunday);
        setOpenSpecial(false);
      } catch (e) {
        console.error("Failed to save speaker", e);
      }
    }
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
                  <SundayContainer_Speaker
                    key={sunday.date}
                    id={sunday.date}
                    items={items}
                    sunday={sunday}
                    setOpen={setOpen}
                    handleAddSpeaker={handleAddSpeaker}
                    specialSundays={specialSundays}
                    handleOpenEdit={handleOpenEdit}
                    handleAddSpecial={handleAddSpecial}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeItem && (
            <DraggableItem_Speaker
              id={activeItem.id}
              name={activeItem.name}
              subject={activeItem.subject}
            />
          )}
        </DragOverlay>
      </DndContext>
      {/* //Add Speaker */}
      <AddSpeakerPopup
        open={open}
        handleClose={handleClose}
        handleSaveSpeaker={handleSaveSpeaker}
        selectedMember={selectedMember}
        setSelectedMember={setSelectedMember}
        members={members}
        scheduledSpeaker={scheduledSpeaker}
        setScheduledSpeaker={setScheduledSpeaker}
      />
      {/* //Edit Speaker */}
      <EditSpeakerPopup
        openEdit={openEdit}
        handleClose={handleClose}
        selectedMember={selectedMember}
        setSelectedMember={setSelectedMember}
        members={members}
        scheduledSpeaker={scheduledSpeaker}
        setScheduledSpeaker={setScheduledSpeaker}
      />
      {/* //Special Sunday */}
      <AddSpecialPopup
        open={openSpecial}
        handleClose={handleClose}
        handleSave={handleSaveSpecial}
        setSpecialSunday={setSpecialSunday}
        specialSunday={specialSunday}
      />
    </div>
  );
};

export default Speakers;
