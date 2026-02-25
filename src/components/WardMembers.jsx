import React, { useState } from "react";
import {
  Checkbox,
  TextField,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import MemberDetail from "./MemberEditor/MemberDetail";
import CreateUserPopup from "./Popups/CreateUserPopup";
import { membersStore } from "../stores/members";
import { usersStore } from "../stores/users";

const apiURL = import.meta.env.VITE_API_URL;

const WardMembers = () => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValues, setEditValues] = useState({
    first_name: "",
    last_name: "",
    calling: "",
  });
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [memberToPromote, setMemberToPromote] = useState(null);

  const {
    members,
    saveMember,
    removeMember,
    updateMemberField,
    fetchMemberData,
    memberData,
  } = membersStore();

  const { users } = usersStore();

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
      calling: member.calling || "",
    });
  };

  // Handle input changes for first name and last name
  const handleInputChange = (e, memberId) => {
    const { name, value } = e.target;
    setEditValues({
      ...editValues,
      [name]: value,
    });

    // Check if this is a calling change that requires user promotion
    if (name === "calling") {
      const leadershipCallings = [
        "Bishop",
        "Bishopric First Counselor",
        "Bishopric Second Counselor",
        "Stake Representative",
        "Ward Executive Secretary",
        "Ward Clerk",
      ];

      const member = members.find((m) => m.id === memberId);
      const isCurrentlyUser = users.some((u) => u.memberId === memberId);

      if (leadershipCallings.includes(value) && !isCurrentlyUser) {
        // This calling requires a user account, but member doesn't have one
        setMemberToPromote(member);
        setShowCreateUser(true);
        // Don't update the calling yet - wait for user creation
        return;
      }
    }

    // Update the field normally
    updateMemberField(memberId, name, value);
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
          {/* <div className="header-cell">Gender</div> */}
          <div className="header-cell">Calling</div>
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
                    member.active === 1 ? 0 : 1,
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
            {/* <div className="table-cell">{member.sex}</div> */}

            {/* Calling */}
            <div className="table-cell">
              {editingIndex === index ? (
                <FormControl fullWidth size="small" variant="standard">
                  <Select
                    name="calling"
                    value={editValues.calling || member.calling || ""}
                    onChange={(e) => handleInputChange(e, member.id)}
                    label="Calling"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    <MenuItem value="Bishop">Bishop</MenuItem>
                    <MenuItem value="Bishopric First Counselor">
                      Bishopric First Counselor
                    </MenuItem>
                    <MenuItem value="Bishopric Second Counselor">
                      Bishopric Second Counselor
                    </MenuItem>
                    <MenuItem value="Stake Representative">
                      Stake Representative
                    </MenuItem>
                    <MenuItem value="Ward Executive Secretary">
                      Ward Executive Secretary
                    </MenuItem>
                    <MenuItem value="Ward Clerk">Ward Clerk</MenuItem>
                    <MenuItem value="Chorister">Chorister</MenuItem>
                    <MenuItem value="Organist">Organist</MenuItem>
                  </Select>
                </FormControl>
              ) : (
                <span onClick={() => handleEdit(member.id, index)}>
                  {member.calling || "None"}
                </span>
              )}
            </div>

            {/* Can Ask Checkbox */}
            <div className="table-cell">
              <Checkbox
                checked={member.can_ask === 1}
                onChange={() =>
                  updateMemberField(
                    member.id,
                    "can_ask",
                    member.can_ask === 1 ? 0 : 1,
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

      <CreateUserPopup
        open={showCreateUser}
        handleClose={() => {
          setShowCreateUser(false);
          setMemberToPromote(null);
          // If user was created, update the calling now
          if (memberToPromote) {
            updateMemberField(
              memberToPromote.id,
              "calling",
              editValues.calling,
            );
          }
        }}
        memberData={memberToPromote}
      />
    </div>
  );
};

export default WardMembers;
