import { Avatar } from "@mui/material";
import {
  getCounterpartAvatarColor,
  getCounterpartInitials,
} from "../model/chat.helpers";

export function CounterpartAvatar({ counterpart, size = 32, fontSize }) {
  const isLogo = counterpart?.avatarFit === "contain";

  return (
    <Avatar
      src={counterpart?.avatarUrl || undefined}
      variant={isLogo ? "rounded" : "circular"}
      sx={{
        width: size,
        height: size,
        fontSize: fontSize ?? Math.round(size * 0.4),
        fontWeight: 700,
        bgcolor: isLogo ? "common.white" : getCounterpartAvatarColor(counterpart),
        color: "common.white",
        flexShrink: 0,
        ...(isLogo && {
          p: 0.5,
          border: "1px solid",
          borderColor: "divider",
          "& .MuiAvatar-img": { objectFit: "contain" },
        }),
      }}
    >
      {getCounterpartInitials(counterpart)}
    </Avatar>
  );
}
