import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useLayoutEffect,
} from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { membersStore } from "../stores/members";
import { programStore } from "../stores/program";
import { speakersStore } from "../stores/speakers";
import SundayContainer_Speaker from "../components/Schedule/SundayContainer_Speaker";
import DraggableItem_Speaker from "../components/Schedule/DraggableItem_Speaker";
import AddSpecialPopup from "../components/Popups/AddSpecialPopup";
import AddSpeakerPopup from "../components/Popups/AddSpeakerPopup";
import EditSpeakerPopup from "../components/Popups/EditSpeakerPopup";
import AddMemberPopup from "../components/Popups/AddMemberPopup";
import AddEventPopup from "../components/Popups/AddEventPopup";
import { useMediaQuery } from "@mui/material";
import axios from "axios";
import {
  mapToSundaysFormat,
  groupSundaysByMonth,
  getCurrentMonth,
} from "./SchedulePage.logic";

// Helper: get all Sundays in a month
function getAllSundays(year, month) {
  const sundays = [];
  const date = new Date(year, month - 1, 1);
  // Find first Sunday
  while (date.getDay() !== 0) date.setDate(date.getDate() + 1);
  while (date.getMonth() === month - 1) {
    sundays.push(date.toISOString().slice(0, 10));
    date.setDate(date.getDate() + 7);
  }
  return sundays;
}

// Merge all speakers for the same date into one object
function mergeSundaysByDate(sundays) {
  const merged = {};
  sundays.forEach(({ date, speakers }) => {
    if (!merged[date]) merged[date] = { date, speakers: [] };
    merged[date].speakers = merged[date].speakers.concat(
      (speakers || []).filter(Boolean),
    );
  });
  return Object.values(merged);
}

// Build containers object: { [date]: [speakers] }
const buildContainers = (sundays) =>
  sundays.reduce((acc, sunday) => {
    acc[sunday.date] = (sunday.speakers || [])
      .filter((sp) => sp && sp.id)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) // <-- sort by order here
      .map((sp) => ({
        ...sp,
        id: sp.id,
        label: sp.label || sp.name || "No Label",
      }));
    return acc;
  }, {});

function mapSpeakerHistoryToSundays(speakerHistory) {
  const byDate = {};
  (speakerHistory || []).forEach((entry) => {
    if (!entry.date) return;
    if (!byDate[entry.date]) byDate[entry.date] = [];
    byDate[entry.date].push({
      id: entry.id, // unique instance id for this scheduled speaker
      speaker_id: entry.speaker_id, // member id (should be different from id)
      label:
        entry.first_name && entry.last_name
          ? `${entry.first_name} ${entry.last_name}`
          : entry.first_name || entry.last_name || "No Name",
      subject: entry.subject,
      order: entry.order,
      ...entry,
    });
  });
  return Object.entries(byDate).map(([date, speakers]) => ({ date, speakers }));
}

// Helper: get all months between two dates (inclusive)
function getAllYearMonths(startYear, startMonth, endYear, endMonth) {
  const months = [];
  let year = startYear;
  let month = startMonth;
  while (year < endYear || (year === endYear && month <= endMonth)) {
    months.push({ year, month });
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }
  return months;
}

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

const defaultEvent = {
  subject: "",
};

export default function Speakers() {
  const { members, fetchMemberData } = membersStore();
  const { specialSundays, setSpecialSundays } = programStore();
  const { speakerHistory2, getSpeakerHistory2 } = speakersStore();
  const [activeId, setActiveId] = useState(null);
  const [selectedMember, setSelectedMember] = useState({ member: "" });
  const [scheduledSpeaker, setScheduledSpeaker] = useState();
  const [open, setOpen] = useState(false);
  const [openAddMember, setOpenAddMember] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openSpecial, setOpenSpecial] = useState(false);
  const [openAddEvent, setOpenAddEvent] = useState(false);
  const [specialSunday, setSpecialSunday] = useState(defaultSpecialSunday);
  const [outsideCreate, setOutsideCreate] = useState({});
  const [eventValue, setEventValue] = useState(defaultEvent);

  const isMobile = useMediaQuery("(max-width:499px)");

  const handleClose = () => {
    setSelectedMember({ member: "" });
    setScheduledSpeaker(defaultScheduledSpeaker);
    setSpecialSunday(defaultSpecialSunday);
    setOpen(false);
    setOpenEdit(false);
    setOpenSpecial(false);
    setOpenAddMember(false);
    setOpenAddEvent(false);
  };

  const onAddMember = (newMember) => {
    let memberObj = {};
    if (typeof newMember === "string") {
      const parts = newMember.trim().split(" ");
      if (parts.length >= 2) {
        memberObj = {
          firstName: parts[0],
          lastName: parts.slice(1).join(" "),
        };
      } else {
        memberObj = {
          firstName: parts[0],
          lastName: "",
        };
      }
    } else {
      memberObj = newMember;
    }
    setOpenAddMember(true);
    setOutsideCreate(memberObj);
  };

  const handleSaveSpeaker = async () => {
    if (selectedMember && selectedMember.member && scheduledSpeaker?.date) {
      const updatedState = {
        ...scheduledSpeaker,
        speaker_id: selectedMember.member.id,
        speaker_name: `${selectedMember.member.first_name} ${selectedMember.member.last_name}`,
        order: scheduledSpeaker.order ?? 1,
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

  const handleSaveEvent = async () => {
    const updatedState = {
      date: eventValue.date,
      speaker_id: 410, //This is for an event in the program that's not a speaker
      speaker_name: `${"Program"} ${"Event"}`,
      order: eventValue.order ?? 1,
      subject: eventValue.subject,
    };

    try {
      await axios.post(`/api/speaker`, {
        newDates: [updatedState.date],
        speakerId: updatedState.speaker_id,
        order: updatedState.order,
        subject: updatedState.subject,
      });

      getSpeakerHistory2();
      setSelectedMember({ member: "" });
      setScheduledSpeaker(defaultScheduledSpeaker);
      setOpenAddEvent(false);
    } catch (e) {
      console.error("Failed to save speaker", e);
    }
  };

  const handleOpenEdit = (speaker) => {
    let editingMember = members.find(
      (member) => member.id === speaker.speaker_id,
    );
    setSelectedMember({ member: editingMember });
    setScheduledSpeaker(speaker);
    setOpenEdit(true);
  };

  const handleDeleteSpeaker = async (speaker) => {
    try {
      await axios.delete(`/api/delete-speaker/${speaker.id}`);
      getSpeakerHistory2();
    } catch (error) {}
  };

  const handleAddSpecial = (date) => {
    setOpenSpecial(true);
    setSpecialSunday((prev) => ({
      ...prev,
      date: date,
    }));
  };

  const handleAddSpeaker = (date) => {
    setOpen(true);
    console.log(date);
    setScheduledSpeaker((prev) => ({
      ...prev,
      date: date,
    }));
  };

  const handleAddEvent = (date) => {
    setOpenAddEvent(true);
    setEventValue((prev) => ({
      ...prev,
      date: date,
    }));
  };

  // 1. Map and merge speaker data as before
  const sundaysWithSpeakers = useMemo(
    () => mapSpeakerHistoryToSundays(speakerHistory2),
    [speakerHistory2],
  );
  const mergedSundays = useMemo(
    () => mergeSundaysByDate(sundaysWithSpeakers),
    [sundaysWithSpeakers],
  );

  // 2. Find min/max year/month in your data
  const today = new Date();
  const nextYear = today.getFullYear() + 1;
  const minYearMonth = mergedSundays.reduce(
    (min, { date }) => {
      const [year, month] = date.split("-").map(Number);
      if (year < min.year || (year === min.year && month < min.month)) {
        return { year, month };
      }
      return min;
    },
    { year: today.getFullYear(), month: today.getMonth() + 1 },
  );

  // 3. Generate all months from minYearMonth to nextYear/12
  const allYearMonths = useMemo(
    () => getAllYearMonths(minYearMonth.year, minYearMonth.month, nextYear, 12),
    [minYearMonth, nextYear],
  );

  // 4. Generate all Sundays for each year/month, merge with speaker data
  const allSundays = useMemo(() => {
    let sundays = [];
    allYearMonths.forEach(({ year, month }) => {
      getAllSundays(year, month).forEach((date) => {
        const found = mergedSundays.find((s) => s.date === date);
        sundays.push({ date, speakers: found ? found.speakers : [] });
      });
    });
    return sundays;
  }, [allYearMonths, mergedSundays]);

  const [containers, setContainers] = useState(() =>
    buildContainers(allSundays),
  );

  useEffect(() => {
    setContainers(buildContainers(allSundays));
    // eslint-disable-next-line
  }, [speakerHistory2]);

  // 7. Group for rendering (sort speakers by order)
  const groupedSundays = useMemo(() => {
    // Only sort if speakerHistory2 is loaded (prevents janky reordering after fade-in)
    if (!speakerHistory2 || speakerHistory2.length === 0) return [];
    const groupedRaw = groupSundaysByMonth(allSundays);
    // Sort speakers within each Sunday
    groupedRaw.forEach(([month, sundays]) => {
      sundays.forEach((sunday) => {
        if (sunday.speakers && sunday.speakers.length > 1) {
          sunday.speakers.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        }
      });
    });
    return groupedRaw;
  }, [allSundays, speakerHistory2]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const findContainer = (id) => {
    if (id in containers) return id;
    for (const key in containers) {
      if (containers[key].find((item) => item.id === id)) return key;
    }
    return null;
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  // Add API URL
  const apiURL = import.meta.env.VITE_API_URL;

  // Save speaker order/date on drag-and-drop
  const saveUpdatedDate = async (updatedItems) => {
    try {
      const updatePromises = updatedItems.map((item) =>
        axios.patch(`/api/speaker/${item.id}`, {
          date: item.date,
          order: item.order,
        }),
      );
      await Promise.all(updatePromises);
      if (typeof getSpeakerHistory2 === "function") getSpeakerHistory2();
    } catch (error) {
      console.error("Failed to update speaker date/order", error);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      return;
    }
    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);

    if (!activeContainer || !overContainer) {
      setActiveId(null);
      return;
    }

    if (activeContainer === overContainer) {
      const oldIndex = containers[activeContainer].findIndex(
        (i) => i.id === active.id,
      );
      const newIndex = containers[overContainer].findIndex(
        (i) => i.id === over.id,
      );
      setContainers((prev) => {
        const newArr = arrayMove(prev[activeContainer], oldIndex, newIndex);
        // Save new order to backend (reordering within the same Sunday)
        const updatedItems = newArr.map((item, idx) => ({
          ...item,
          date: activeContainer,
          order: idx + 1,
        }));
        saveUpdatedDate(updatedItems);
        return {
          ...prev,
          [activeContainer]: newArr,
        };
      });
    } else {
      const activeItem = containers[activeContainer].find(
        (i) => i.id === active.id,
      );
      setContainers((prev) => {
        const newActive = prev[activeContainer].filter(
          (i) => i.id !== active.id,
        );
        const overIndex = prev[overContainer].findIndex(
          (i) => i.id === over.id,
        );
        const newOver =
          overIndex === -1
            ? [...prev[overContainer], activeItem]
            : [
                ...prev[overContainer].slice(0, overIndex),
                activeItem,
                ...prev[overContainer].slice(overIndex),
              ];
        // Save new order and date to backend (moving to another Sunday)
        const updatedItems = newOver.map((item, idx) => ({
          ...item,
          date: overContainer,
          order: idx + 1,
        }));
        saveUpdatedDate(updatedItems);
        return {
          ...prev,
          [activeContainer]: newActive,
          [overContainer]: newOver,
        };
      });
    }
    setActiveId(null);
  };

  const activeItem =
    activeId &&
    Object.values(containers)
      .flat()
      .find((item) => item.id === activeId);

  // Ref map for month containers (by monthKey, e.g. "2024-06")
  const monthRefs = useRef({});

  // Find current year/month as string keys
  //const today = new Date();
  const currentYear = today.getFullYear().toString();

  const currentMonth = getCurrentMonth();
  const currentMonthRef = useRef(null);

  const [hasScrolledToCurrentMonth, setHasScrolledToCurrentMonth] =
    useState(false);

  // Scroll to the correct month-row on initial load only
  useLayoutEffect(() => {
    // Only scroll on initial load and when grouped data is first available
    if (
      !hasScrolledToCurrentMonth &&
      groupedSundays &&
      groupedSundays.length > 0
    ) {
      const ref = currentMonthRef.current;
      if (ref) {
        let parent = ref;
        while (parent && !parent.classList.contains("container")) {
          parent = parent.parentElement;
        }
        if (parent && parent.scrollTop !== undefined) {
          parent.scrollTop = ref.offsetTop - parent.offsetTop - 68;
        }
      }
      setHasScrolledToCurrentMonth(true);
    }
    // eslint-disable-next-line
  }, [groupedSundays, currentMonth, hasScrolledToCurrentMonth]);

  return (
    <div className="container" style={{ overflowY: "auto", height: "92vh" }}>
      <div className="scheduling-container">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {groupedSundays.map(([month, sundays]) => (
            <div
              key={month}
              ref={month === currentMonth ? currentMonthRef : null}
            >
              <h3>{month}</h3>
              <div className="month-row">
                <SortableContext
                  items={sundays.flatMap(
                    (sunday) =>
                      containers[sunday.date]?.map((item) => item.id) || [],
                  )}
                  strategy={verticalListSortingStrategy}
                >
                  {sundays.map((sunday) => (
                    <SundayContainer_Speaker
                      key={sunday.date}
                      date={sunday.date}
                      handleAddSpecial={handleAddSpecial}
                      handleAddSpeaker={handleAddSpeaker}
                      handleAddEvent={handleAddEvent}
                      setSelectedMember={setSelectedMember}
                      setScheduledSpeaker={setScheduledSpeaker}
                      selectedMember={selectedMember}
                      specialSundays={specialSundays}
                    >
                      {(containers[sunday.date] || []).length === 0
                        ? null
                        : containers[sunday.date]
                            .filter((item) => item && item.id)
                            .map((item) => (
                              <DraggableItem_Speaker
                                key={item.id}
                                id={item.id}
                                name={item.label}
                                subject={item.subject}
                                speaker_id={item.speaker_id}
                                handleOpenEdit={handleOpenEdit}
                                handleDeleteSpeaker={handleDeleteSpeaker}
                              />
                            ))}
                    </SundayContainer_Speaker>
                  ))}
                </SortableContext>
              </div>
            </div>
          ))}
          <DragOverlay>
            {activeItem ? (
              <div
                style={{
                  padding: "8px",
                  backgroundColor: "#fbefd8",
                  border: "1px solid #f9c399",
                  borderRadius: "4px",
                  opacity: 0.8,
                  fontSize: "0.9rem",
                }}
              >
                <div style={{ fontWeight: 600 }}>
                  {activeItem.label || activeItem.name}
                </div>
                <div style={{ fontStyle: "italic", color: "#cb8525" }}>
                  {activeItem.subject}
                </div>
              </div>
            ) : null}
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
          scheduledSpeaker={scheduledSpeaker ?? defaultScheduledSpeaker}
          setScheduledSpeaker={setScheduledSpeaker}
          onAddMember={onAddMember}
        />
        {/* //Edit Speaker */}
        <EditSpeakerPopup
          openEdit={openEdit}
          handleClose={() => {
            setOpenEdit(false);
            setScheduledSpeaker(defaultScheduledSpeaker);
            setSelectedMember({ member: "" });
          }}
          selectedMember={selectedMember}
          setSelectedMember={setSelectedMember}
          members={members}
          scheduledSpeaker={scheduledSpeaker ?? defaultScheduledSpeaker}
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
        {/* // Add Member Popup */}
        <AddMemberPopup
          open={openAddMember}
          handleClose={handleClose}
          onAddMember={onAddMember}
          outsideCreate={outsideCreate || null}
          setOutsideCreate={setOutsideCreate}
        />
        {/* // Add Event Popup */}
        <AddEventPopup
          open={openAddEvent}
          handleClose={handleClose}
          handleSave={handleSaveEvent}
          eventValue={eventValue}
          setEventValue={setEventValue}
        />
      </div>
    </div>
  );
}
