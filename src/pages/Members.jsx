import React, { useState } from "react";
import { Fab, Backdrop } from "@mui/material";
import Add from "@mui/icons-material/Add";
import AddMemberPopup from "../components/Popups/AddMemberPopup";
import WardMembers from "../components/WardMembers";
import { uiStore } from "../stores/uiStore";
import { dataStore } from "../stores/data";
import { membersStore } from "../stores/members";

const Members = () => {
  const { members, setMembers, memberData } = dataStore();
  const { fetchMemberData } = membersStore();
  //const fetchMemberData = membersStore((state) => state.fetchMemberData);

  const [isAddMember, setIsAddMember] = useState(false);

  const handleAddMember = () => {
    setIsAddMember(true);
  };

  const handleClose = () => {
    setIsAddMember(false);
    uiStore.getState().setSidebarOpen(false);
  };

  return (
    <>
      <WardMembers
        members={members}
        setMembers={setMembers}
        fetchMemberData={fetchMemberData}
        memberData={memberData}
      />
      <Backdrop open={isAddMember} sx={{ zIndex: 2 }} />
      <AddMemberPopup
        open={isAddMember}
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
    </>
  );
};

export default Members;
