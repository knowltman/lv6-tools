import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { Card, AvatarGroup, Tooltip } from "@mui/material";
import { format, parseISO, getDate } from "date-fns";
import DraggableItem_Music from "./DraggableItem_Music";
import { Add } from "@mui/icons-material";
import { AvatarButton } from "./AvatarButton";

const SundayContainer_Music = ({
  id,
  items,
  sunday,
  setOpen,
  handleAddMusic,
  specialSundays,
  handleDeleteMusic,
  handleAddChoristerOrganist,
  // setSelectedChorister,
  // setSelectedOrganist,
  setChoristerOrganistForm,
  members,
  musicAdmin,
}) => {
  const { setNodeRef } = useDroppable({ id });

  //console.log(musicAdmin.find((data) => data.date === sunday.date));

  // const chorister = members.find(
  //   (member) =>
  //     member.id === musicAdmin.chorister_id && musicAdmin.date === sunday.date
  // );
  // const organist = members.find(
  //   (member) =>
  //     member.id === musicAdmin.organist_id && musicAdmin.date === sunday.date
  // );

  const hasChoristerOrganist = musicAdmin.find(
    (data) => data.date === sunday.date,
  );

  //console.log(hasChoristerOrganist);

  // Check if the current Sunday is a special Sunday
  const specialSunday = specialSundays.find(
    (special) => special.date === sunday.date,
  );

  const getName = (id) => {
    const name = members.find((member) => member.id === id);
    // console.log({
    //   member: name,
    //   fullName: `${name.first_name} ${name.last_name}`,
    // });
    return { member: name, fullName: `${name.first_name} ${name.last_name}` };
  };

  const getInitials = (id) => {
    const name = getName(id);
    return `${name.member.first_name?.[0] ?? ""}${
      name.member.last_name?.[0] ?? ""
    }`.toUpperCase();
  };

  const handleAvatarGroupClick = () => {
    console.log("Avatar clicked for sunday:", sunday, "date:", sunday.date);
    handleAddChoristerOrganist(sunday.date);
  };

  const isConferenceSunday =
    getDate(parseISO(sunday.date)) <= 7 &&
    parseISO(sunday.date).getDay() === 0 &&
    (parseISO(sunday.date).getMonth() === 3 ||
      parseISO(sunday.date).getMonth() === 9);

  // Collect types already added for the current Sunday
  const addedTypes = items
    .filter((item) => format(parseISO(item.date), "yyyy-MM-dd") === sunday.date)
    .map((item) => item.type);

  return (
    <Card ref={setNodeRef} className="sunday-card" variant="outlined">
      <div className="card--header">
        <div className="card--title">
          {format(parseISO(sunday.date), "MMMM d")}
        </div>
        {!isConferenceSunday && (
          <AvatarGroup>
            {hasChoristerOrganist ? (
              <AvatarButton
                type="chorister"
                initials={getInitials(hasChoristerOrganist.chorister_id)}
                onClick={() => {
                  handleAvatarGroupClick();
                }}
              />
            ) : (
              <AvatarButton
                onClick={() => handleAddChoristerOrganist(sunday.date)}
                style={{ fill: "#333" }}
              />
            )}
            {hasChoristerOrganist ? (
              <AvatarButton
                type="organist"
                initials={getInitials(hasChoristerOrganist.organist_id)}
                onClick={() => {
                  handleAvatarGroupClick();
                }}
              />
            ) : (
              <AvatarButton
                onClick={() => {
                  handleAddChoristerOrganist(sunday.date);
                }}
                style={{ fill: "#333" }}
              />
            )}
          </AvatarGroup>
        )}
      </div>
      <div
        className={`card--content ${
          isConferenceSunday ||
          (specialSunday &&
            !["Other", "Fast Sunday"].includes(specialSunday.type))
            ? "special-sunday"
            : ""
        }`}
      >
        {items
          .filter(
            (item) => format(parseISO(item.date), "yyyy-MM-dd") === sunday.date,
          )
          .map((item) => (
            <DraggableItem_Music
              key={item.id}
              id={item.id}
              name={item.name}
              type={item.type}
              number={item.hymn_number}
              performer={item.performer}
              setOpen={setOpen}
              date={item.date}
              handleDeleteMusic={handleDeleteMusic}
            />
          ))}

        {specialSunday &&
        !["Other", "Fast Sunday"].includes(specialSunday.type) ? (
          <div className="special-sunday-type">
            {specialSunday.description || specialSunday.type}
          </div>
        ) : isConferenceSunday ? (
          <div className="special-sunday-type">General Conference</div>
        ) : (
          <div
            className="add-item-button"
            onClick={() => handleAddMusic(sunday.date, addedTypes)}
          >
            <Add fontSize="small" />
            Add Music
          </div>
        )}
      </div>
    </Card>
  );
};

export default SundayContainer_Music;
