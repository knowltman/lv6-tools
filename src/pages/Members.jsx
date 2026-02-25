import React, { useState } from "react";
import { Fab, Backdrop } from "@mui/material";
import Add from "@mui/icons-material/Add";
import PersonAdd from "@mui/icons-material/PersonAdd";
import AddMemberPopup from "../components/Popups/AddMemberPopup";
import CreateUserPopup from "../components/Popups/CreateUserPopup";
import WardMembers from "../components/WardMembers";
import { uiStore } from "../stores/uiStore";
import { dataStore } from "../stores/data";
import { membersStore } from "../stores/members";

const Members = () => {
  const { members, setMembers, memberData, fetchMemberData } = membersStore();
  //const fetchMemberData = membersStore((state) => state.fetchMemberData);

  const [isAddMember, setIsAddMember] = useState(false);
  const [isCreateUser, setIsCreateUser] = useState(false);

  const handleAddMember = () => {
    setIsAddMember(true);
  };

  const handleCreateUser = () => {
    setIsCreateUser(true);
  };

  const handleClose = () => {
    setIsAddMember(false);
    setIsCreateUser(false);
    uiStore.getState().setSidebarOpen(false);
  };

  return (
    <>
      <WardMembers />
      {/* <Backdrop open={isAddMember} sx={{ zIndex: 2 }} /> */}
      <AddMemberPopup
        open={isAddMember}
        handleClose={handleClose}
        style={{ zIndex: 3 }}
      />
      <CreateUserPopup
        open={isCreateUser}
        handleClose={handleClose}
        style={{ zIndex: 3 }}
      />
      <Fab
        size="large"
        sx={{
          position: "absolute",
          bottom: "30px",
          right: "30px",
          textTransform: "capitalize",
          fontWeight: 600,
        }}
        variant="extended"
        color="primary"
        aria-label="add"
        onClick={() => {
          handleAddMember();
        }}
      >
        <Add sx={{ mr: 1 }} />
        Add Member
      </Fab>
      <Fab
        size="large"
        sx={{
          position: "absolute",
          bottom: "100px",
          right: "30px",
          textTransform: "capitalize",
          fontWeight: 600,
        }}
        variant="extended"
        color="secondary"
        aria-label="create-user"
        onClick={() => {
          handleCreateUser();
        }}
      >
        <PersonAdd sx={{ mr: 1 }} />
        Create User
      </Fab>
    </>
  );
};

export default Members;
