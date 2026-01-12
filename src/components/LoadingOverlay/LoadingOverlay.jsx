import {
  Backdrop,
  CircularProgress,
  circularProgressClasses,
} from "@mui/material";
const LoadingOverlay = ({ isLoading = false }) => {
  return (
    <Backdrop
      sx={{ color: "grey.900", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={isLoading}
    >
      <CircularProgress
        color="primary"
        sx={{
          color: "#faebd7 !important",
          [`& .${circularProgressClasses.circle}`]: {
            strokeLinecap: "round",
          },
        }}
      />
    </Backdrop>
  );
};

export default LoadingOverlay;
