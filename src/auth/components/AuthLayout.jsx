import { Box, Paper } from "@mui/material";
import { useRegister } from "../context/InviteContext";
import { useEffect } from "react";

export default function AuthLayout({ children }) {
  const { invite, setInvite } = useRegister();

  // Значение invite
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const inviteCode = params.get("invite");

    if (inviteCode) {
      setInvite(inviteCode);
    }
  }, []);

  return (
    <Box
      sx={{
        background: "#f3f4f6",
        minHeight: "100vh",
        bgcolor: "#f3f4f6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: {
            xs: 320,
            md: 380,
          },
          p: 4,
          m: 2,
          borderRadius: 3,
          border: "1px solid #e5e7eb",
          bgcolor: "#fff",
        }}
      >
        {children}
      </Paper>
    </Box>
  );
}
