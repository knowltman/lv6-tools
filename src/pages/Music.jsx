import React, { useState, useEffect, useRef } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import SundayContainer_Music from "../components/Schedule/SundayContainer_Music";
import DraggableItem_Music from "../components/Schedule/DraggableItem_Music";
import axios from "axios";
import {
  mapToSundaysMusicFormat,
  groupSundaysByMonth,
  getCurrentMonth,
} from "./SchedulePage.logic";
import AddMusicPopup from "../components/Popups/AddMusicPopup";
import { membersStore } from "../stores/members";
import { dataStore } from "../stores/data";
import { programStore } from "../stores/program";
import { musicStore } from "../stores/music";
import { formStore } from "../stores/formValues";
import AddOrganistChorister from "../components/Popups/AddOrganistChorister";
import { defaultFormValues } from "../app.logic";

const defaultScheduledMusic = {
  name: "",
  performer: "Ward Choir",
  type: "opening",
  date: undefined,
};

const Music = (props) => {
  const { date } = props;
  const defaultChorister = defaultFormValues.chorister;

  const members = membersStore((state) => state.members);
  const specialSundays = programStore((state) => state.specialSundays);
  const { musicHistory2, getMusicHistory2, musicAdmin } = musicStore();
  const { hymns } = dataStore();
  const [sundaysJson, setSundaysJson] = useState({ sundays: [] });

  const [items, setItems] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [scheduledMusic, setScheduledMusic] = useState(defaultScheduledMusic);

  const [choristerOrganistOpen, setChoristerOrganistOpen] = useState(false);
  const [selectedChorister, setSelectedChorister] = useState();
  const [selectedOrganist, setSelectedOrganist] = useState();
  const [choristerOrganistForm, setChoristerOrganistForm] = useState({
    chorister: { first_name: "", last_name: "" },
    organist: { first_name: "", last_name: "" },
    date: date || "",
  });

  const [selectedHymn, setSelectedHymn] = useState({ number: "", name: "" });
  const [disabledItems, setDisabledItems] = useState();

  const currentMonth = getCurrentMonth();
  const currentMonthRef = useRef(null);

  const excludedTypes = [
    "Primary Program",
    "Christmas Program",
    "Ward Conference",
  ];

  const filteredSpecialSundays =
    specialSundays &&
    specialSundays.filter((sunday) => !excludedTypes.includes(sunday.type));

  useEffect(() => {
    if (
      musicHistory2 &&
      Array.isArray(musicHistory2) &&
      musicHistory2.length > 0
    ) {
      const currentYear = new Date().getFullYear();
      const years = Array.from(
        { length: currentYear - 2023 + 2 },
        (_, i) => 2024 + i
      );

      const mappedSundays = years.flatMap((year) =>
        mapToSundaysMusicFormat(musicHistory2, musicAdmin, year)
      );

      const filteredSunday = mappedSundays.filter(
        (sunday) => date === sunday.date
      );

      if (!filteredSunday) return;

      setSundaysJson({ sundays: mappedSundays });

      // Flatten out the entries for each sunday and handle each music entry type separately
      const initialItems = mappedSundays.flatMap((sunday) =>
        ["opening", "sacrament", "intermediate", "closing"]
          .map((type) => sunday[type]) // Map each type of music
          .filter((music) => music && music.id) // Filter out empty slots or entries without an ID
          .map((music) => ({
            id: music.id,
            hymn_number: music.hymn_number,
            name: music.name,
            performer: music.performer,
            type: music.type,
            date: music.date,
            chorister: music.chorister,
            organist: music.organist,
          }))
      );

      setItems(initialItems);
      setIsLoading(false);
    }
  }, [musicHistory2]);

  useEffect(() => {
    if (!isLoading && currentMonthRef.current) {
      currentMonthRef.current.scrollIntoView({
        block: "start",
      });
    }
  }, [currentMonth, isLoading]);

  const apiURL = import.meta.env.VITE_API_URL;

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
        axios.patch(`/api/music/${item.id}`, {
          date: item.date,
          order: item.order,
        })
      );

      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Failed to update speaker date/order", error);
    }
  };

  const handleDeleteMusic = async (musicId) => {
    try {
      const response = await axios.delete(`/api/music`, {
        params: {
          musicId: musicId.id,
        },
      });
    } catch (e) {
      console.error("Error deleting music date", e);
    }
    getMusicHistory2();
  };

  const handleAddMusic = (date, addedTypes) => {
    setDisabledItems(addedTypes);
    setOpen(true);
    setScheduledMusic((prev) => ({
      ...prev,
      date: date,
    }));
  };

  const handleSaveSong = async () => {
    let formData;
    let songFormData;

    formData = {
      date: scheduledMusic.date,
      hymn_number: undefined,
      song_title: scheduledMusic.name,
      name: scheduledMusic.name,
      performer: scheduledMusic.performer,
      type: scheduledMusic.type,
    };

    songFormData = {
      [`${scheduledMusic.type}_hymn`]: {
        id: 99999,
        key:
          scheduledMusic.performer?.first_name != undefined
            ? `${scheduledMusic.performer.first_name} ${scheduledMusic.performer.last_name}`
            : scheduledMusic.performer,
        number: undefined,
        name: scheduledMusic.name,
        performer: scheduledMusic.performer,
      },
    };

    // If the song is a hymn different stuff needs to be set
    if (scheduledMusic.hymn_number) {
      console.log("we have a hymn number!");
      formData.hymn_number = scheduledMusic.hymn_number.number;
      formData.song_title = scheduledMusic.hymn_number.name;
      formData.name = scheduledMusic.hymn_number.name;

      songFormData[`${scheduledMusic.type}_hymn`].number =
        scheduledMusic.hymn_number.number;
      songFormData[`${scheduledMusic.type}_hymn`].name =
        scheduledMusic.hymn_number.name;
    }

    // The intermediate performer is a ward member
    if (scheduledMusic.performer?.first_name != undefined) {
      formData.performer =
        scheduledMusic.performer.first_name +
        " " +
        scheduledMusic.performer.last_name;

      songFormData[`${scheduledMusic.type}_hymn`].performer =
        scheduledMusic.performer.first_name +
        " " +
        scheduledMusic.performer.last_name;
    }

    try {
      const response = await axios.post(`/api/music`, formData);

      const finalData = {
        ...formData,
        id: response.data.id,
      };

      musicStore.setState((state) => ({
        musicHistory2: [...(state.musicHistory2 || []), finalData],
      }));

      formStore
        .getState()
        .updateFormValue(
          `${scheduledMusic.type}_hymn`,
          songFormData[`${scheduledMusic.type}_hymn`]
        );

      setSelectedHymn({ number: "", name: "" });
      setScheduledMusic(defaultScheduledMusic);
      setOpen(false);
    } catch (e) {
      console.error("Failed to save speaker", e);
    }
  };

  const handleClose = () => {
    setSelectedHymn({ member: "" });
    setOpen(false);
  };

  const handleSaveChoristerOrganist = async () => {
    console.log('choristerOrganistForm at save:', choristerOrganistForm);
    const chorister_id = choristerOrganistForm.chorister?.id;
    const organist_id = choristerOrganistForm.organist?.id;
    const sundayDate = choristerOrganistForm.date;

    if (!sundayDate) {
      console.error('ERROR: No date in choristerOrganistForm!', choristerOrganistForm);
      alert('Error: No date selected. Please try opening the popup again.');
      return;
    }

    const formData = {
      date: sundayDate,
      chorister_id: chorister_id,
      organist_id: organist_id,
    };

    console.log('Form data being sent:', formData);

    try {
      const response = await axios.post(`/api/music-admin`, formData);

      // musicStore.setState((state) => ({
      //   musicHistory2: [...(state.musicHistory2 || []), finalData],
      // }));

      // formStore
      //   .getState()
      //   .updateFormValue(
      //     `${scheduledMusic.type}_hymn`,
      //     songFormData[`${scheduledMusic.type}_hymn`]
      //   );

      // setSelectedHymn({ number: "", name: "" });
      // setScheduledMusic(defaultScheduledMusic);
      getMusicHistory2();
      setChoristerOrganistOpen(false);
    } catch (e) {
      console.error("Failed to save music admin data", e);
    }
  };

  const handleCloseChoristerOrganist = () => {
    setChoristerOrganistOpen(false);
    setTimeout(() => {
      setChoristerOrganistForm({
        chorister: { first_name: "", last_name: "" },
        organist: { first_name: "", last_name: "" },
        date: "",
      });
    }, 300);
  };

  const handleAddChoristerOrganist = (date) => {
    console.log('handleAddChoristerOrganist called with date:', date, 'typeof:', typeof date);
    if (!date) {
      console.error('ERROR: handleAddChoristerOrganist called with no date!');
      return;
    }
    
    console.log('musicAdmin available:', !!musicAdmin, 'length:', musicAdmin?.length);
    console.log('members available:', !!members, 'length:', members?.length);
    
    // Find existing music admin data for this date
    const existingAdmin = musicAdmin.find((admin) => admin.date === date);
    console.log('existingAdmin for date', date, ':', existingAdmin);
    
    const existingChorister = existingAdmin?.chorister_id
      ? members.find((member) => member.id === existingAdmin.chorister_id)
      : { first_name: "", last_name: "" };
    const existingOrganist = existingAdmin?.organist_id
      ? members.find((member) => member.id === existingAdmin.organist_id)
      : { first_name: "", last_name: "" };

    const newForm = {
      chorister: existingChorister,
      organist: existingOrganist,
      date: date,
    };
    
    console.log('Setting choristerOrganistForm to:', newForm);
    setChoristerOrganistForm(newForm);
    setChoristerOrganistOpen(true);
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
                  <SundayContainer_Music
                    key={sunday.date}
                    id={sunday.date}
                    items={items}
                    sunday={sunday}
                    musicAdmin={musicAdmin}
                    setOpen={setOpen}
                    handleAddMusic={handleAddMusic}
                    specialSundays={filteredSpecialSundays}
                    handleDeleteMusic={handleDeleteMusic}
                    handleAddChoristerOrganist={handleAddChoristerOrganist}
                    members={members}
                    // setSelectedOrganist={setSelectedOrganist}
                    // setSelectedChorister={setSelectedChorister}
                    setChoristerOrganistForm={setChoristerOrganistForm}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <DragOverlay>
          {activeItem && (
            <DraggableItem_Music
              key={activeItem.id}
              id={activeItem.id}
              name={activeItem.name}
              type={activeItem.type}
              performer={activeItem.performer}
              date={activeItem.date}
            />
          )}
        </DragOverlay>
      </DndContext>

      <AddMusicPopup
        open={open}
        handleClose={handleClose}
        handleSaveSong={handleSaveSong}
        selectedHymn={selectedHymn}
        members={members}
        hymns={hymns}
        scheduledMusic={scheduledMusic}
        setScheduledMusic={setScheduledMusic}
        disabledTypes={disabledItems}
      />
      <AddOrganistChorister
        open={choristerOrganistOpen}
        handleClose={handleCloseChoristerOrganist}
        handleSaveChoristerOrganist={handleSaveChoristerOrganist}
        members={members}
        selectedChorister={selectedChorister}
        setSelectedChorister={setSelectedChorister}
        selectedOrganist={selectedOrganist}
        setSelectedOrganist={setSelectedOrganist}
        choristerOrganistForm={choristerOrganistForm}
        setChoristerOrganistForm={setChoristerOrganistForm}
      />
    </div>
  );
};

export default Music;
