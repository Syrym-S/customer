import { useState } from "react";
import { Box, Button, Tooltip } from "@mui/material";
import PropTypes from "prop-types";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import MarkunreadOutlinedIcon from "@mui/icons-material/MarkunreadOutlined";

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
            textTransform: "none",

            "& .MuiButton-startIcon": {
              flexShrink: 0,
            },
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
