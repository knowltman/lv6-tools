import { Avatar } from "@mui/material";
import { BackHandOutlined } from "@mui/icons-material";

const avatarStyle = {
  width: "20px",
  height: "20px",
  fontSize: "10px",
  fontWeight: "600",
  borderColor: "#f6f6f6 !important",
};
const organistColor = { bgcolor: "orange" };
const choristerColor = { bgcolor: "#7e43cf" };
const undefinedColor = { bgcolor: "#c69bff" };

export const AvatarButton = (props) => {
  const { type, initials, onClick } = props;

  const avatarColor =
    type === "organist"
      ? organistColor
      : type === "chorister"
      ? choristerColor
      : undefinedColor;
  const cursor = onClick ? { cursor: "pointer" } : { cursor: "default" };

  return (
    <Avatar
      sx={[avatarColor, avatarStyle, cursor]}
      onClick={onClick && onClick}
      icon={<BackHandOutlined />}
    >
      {initials}
    </Avatar>
  );
};

export default AvatarButton;
