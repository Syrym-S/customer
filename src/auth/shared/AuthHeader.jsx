import { Box, Typography } from "@mui/material";
import LanguageSelect from "./LanguageSelect";

export default function AuthHeader({
  children,
  languageSelect = <LanguageSelect />,
  mb = 2,
}) {
  return (
    <Box
      component="header"
      sx={{ display: "flex", alignItems: "center", gap: 2, mb }}
    >
      <Typography
        variant="h5"
        sx={{
          flex: 1,
          minWidth: 0,
          overflowWrap: "anywhere",
          fontSize: { xs: "2rem", md: "1.5rem" },
          fontWeight: { xs: 600, md: 400 },
        }}
      >
        {children}
      </Typography>
      <Box sx={{ flexShrink: 0, maxWidth: "40%" }}>{languageSelect}</Box>
    </Box>
  );
}
