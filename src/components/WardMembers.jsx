import React, { useState } from "react";
import { Checkbox, TextField, IconButton } from "@mui/material";
import { Delete } from "@mui/icons-material";
import MemberDetail from "./MemberEditor/MemberDetail";
import { membersStore } from "../stores/members";

const apiURL = import.meta.env.VITE_API_URL;

const WardMembers = () => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValues, setEditValues] = useState({
    first_name: "",
    last_name: "",
  });

  const {
    members,
    saveMember,
    removeMember,
    updateMemberField,
    fetchMemberData,
  } = membersStore();

  // Handle edit start
  // const handleEdit = (memberId, index) => {
  //   const member = members.find((m) => m.id === memberId);

  //   setEditingIndex(index);
  //   setEditValues({
  //     first_name: member.first_name,
  //     last_name: member.last_name,
  //   });
  //   updateMemberField(memberId, "first_name", member.first_name);
  //   updateMemberField(memberId, "last_name", member.last_name);
  // };
  const handleEdit = (memberId, index) => {
    const member = members.find((m) => m.id === memberId);

    // Set the editing index so the row can be highlighted for editing
    setEditingIndex(index);

    // Set the values for editing
    setEditValues({
      first_name: member.first_name,
      last_name: member.last_name,
    });
  };

  // Handle input changes for first name and last name
  const handleInputChange = (e, memberId) => {
    setEditValues({
      ...editValues,
      [e.target.name]: e.target.value,
    });
    updateMemberField(memberId, [e.target.name], e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setEditingIndex(null);
    }
  };

  return (
    <div className="container" style={{ display: "flex" }}>
      <div className="table">
        <div className="header-row">
          <div className="header-cell">Active</div>
          <div className="header-cell">First Name</div>
          <div className="header-cell">Last Name</div>
          <div className="header-cell">Gender</div>
          <div className="header-cell">Can Ask</div>
          <div className="header-cell"></div>
        </div>

        {members.map((member, index) => (
          <div
            className="table-row"
            key={index}
            onClick={() => fetchMemberData(member.id)}
          >
            {/* Active Checkbox */}
            <div className="table-cell">
              <Checkbox
                checked={member.active === 1}
                onChange={() =>
                  updateMemberField(
                    member.id,
                    "active",
                    member.active === 1 ? 0 : 1
                  )
                }
              />
            </div>

            {/* First Name */}
            <div className="table-cell">
              {editingIndex === index ? (
                <TextField
                  fullWidth
                  size="small"
                  name="first_name"
                  onKeyDown={handleKeyDown}
                  value={editValues.first_name}
                  onChange={(e) => handleInputChange(e, member.id)}
                  variant="standard"
                />
              ) : (
                <span onClick={() => handleEdit(member.id, index)}>
                  {member.first_name}
                </span>
              )}
            </div>

            {/* Last Name */}
            <div className="table-cell">
              {editingIndex === index ? (
                <TextField
                  fullWidth
                  size="small"
                  name="last_name"
                  onKeyDown={handleKeyDown}
                  value={editValues.last_name}
                  onChange={(e) => handleInputChange(e, member.id)}
                  variant="standard"
                />
              ) : (
                <span onClick={() => handleEdit(member.id, index)}>
                  {member.last_name}
                </span>
              )}
            </div>

            {/* Gender */}
            <div className="table-cell">{member.sex}</div>

            {/* Can Ask Checkbox */}
            <div className="table-cell">
              <Checkbox
                checked={member.can_ask === 1}
                onChange={() =>
                  updateMemberField(
                    member.id,
                    "can_ask",
                    member.can_ask === 1 ? 0 : 1
                  )
                }
              />
            </div>

            <div
              className="table-cell rollover-activated"
              style={{ justifyContent: "flex-end", marginRight: "1rem" }}
            >
              <IconButton
                variant="contained"
                color="secondary"
                onClick={() => removeMember(member.id)}
              >
                <Delete size="small" />
              </IconButton>
            </div>

            {/* Save button for editable rows */}
            {/* {editingIndex === index && (
              <Button
                onClick={() =>
                  saveMember(member.id, editValues, setEditingIndex)
                }
                variant="contained"
                color="primary"
              >
                Save
              </Button>
            )} */}
          </div>
        ))}
      </div>
      <div className="member-sidebar">
        <MemberDetail />
      </div>
    </div>
  );
};

export default WardMembers;
