import { useState } from "react";
import { Box, Button, Tooltip } from "@mui/material";
import PropTypes from "prop-types";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import MarkunreadOutlinedIcon from "@mui/icons-material/MarkunreadOutlined";

// Kept in its own file (rather than co-located in widgets/header/Header.jsx,
// where it originally lived) so it can be reused by SharedLeadLayout.jsx's
// public/unauthenticated header without dragging in Header.jsx's own
// imports (Notifications, logoutApi, profile fetching, react-router nav
// hooks, etc.) — those aren't referenced by this component itself, but
// living in the same file meant the public bundle picked them up anyway.
export function SupportContacts({ layout = "column" }) {
  const isRow = layout === "row";
  const iconFontSize = isRow ? 16 : undefined;

  const supportEmail = window?.APP_DATA?.support?.email;
  const supportPhone = window?.APP_DATA?.support?.phone;

  const [copied, setCopied] = useState(false);

  const handleCopyPhone = async (event) => {
    event.stopPropagation();

    await navigator.clipboard.writeText(supportPhone);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  return (
    <Box
      sx={
        isRow
          ? {
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 1,
              minWidth: 0,
            }
          : {
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 1,
              minWidth: 0,
            }
      }
    >
      <Tooltip title={supportEmail} placement="top" arrow>
        <Button
          color="primary"
          variant="contained"
          component="a"
          href={`mailto:${supportEmail}?subject=${encodeURIComponent(
            "Обращение в поддержку",
          )}&body=${encodeURIComponent("Здравствуйте! У меня возник вопрос.")}`}
          sx={{
            boxShadow: 0,
            fontSize: isRow ? 11 : 12,
            // MUI's default uppercase transform mangles an email address's
            // readability — not a deliberate style choice here in either
            // layout, so this applies to both, not just the row layout.
            textTransform: "none",

            "& .MuiButton-startIcon": {
              flexShrink: 0,
            },

            // In a row layout the phone button (short, fixed-length) should
            // keep its size — this one shrinks first when space is tight,
            // relying on the inner span's existing ellipsis to stay legible.
            ...(isRow && {
              minWidth: 0,
              flex: "1 1 auto",
            }),
          }}
          startIcon={<MarkunreadOutlinedIcon sx={{ fontSize: iconFontSize }} />}
        >
          <Box
            component="span"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {supportEmail}
          </Box>
        </Button>
      </Tooltip>

      <Tooltip
        title={copied ? "Скопировано" : "Скопировать номер"}
        placement="top"
        arrow
        open={copied ? true : undefined}
      >
        <Button
          color="primary"
          variant="contained"
          onClick={handleCopyPhone}
          sx={{
            boxShadow: 0,
            fontSize: isRow ? 11 : 12,
            textTransform: "none",
            ...(isRow && { flexShrink: 0 }),
          }}
          startIcon={<PhoneOutlinedIcon sx={{ fontSize: iconFontSize }} />}
        >
          {supportPhone}
        </Button>
      </Tooltip>
    </Box>
  );
}

SupportContacts.propTypes = {
  layout: PropTypes.oneOf(["column", "row"]),
};
