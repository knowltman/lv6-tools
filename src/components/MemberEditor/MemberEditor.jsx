import { Drawer, useMediaQuery, IconButton, Box } from "@mui/material";
import MemberDetail from "./MemberDetail";
import { uiStore } from "../../stores/uiStore";
import CloseIcon from "@mui/icons-material/Close";

const MemberEditor = () => {
  const { sidebarOpen, setSidebarOpen } = uiStore((state) => state);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const closeDrawer = () => {
    setSidebarOpen(false);
  };

  return (
    <Drawer
      anchor="right"
      open={sidebarOpen}
      onClose={() => uiStore.getState().setSidebarOpen(false)}
      disableEnforceFocus
    >
      <MemberDetail />
      {isMobile && (
        <Box position="absolute" top={0} right={0}>
          <IconButton onClick={closeDrawer}>
            <CloseIcon />
          </IconButton>
        </Box>
      )}
    </Drawer>
  );
};
export default MemberEditor;
