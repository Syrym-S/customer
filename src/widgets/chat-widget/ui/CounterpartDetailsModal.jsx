import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import MarkunreadOutlinedIcon from "@mui/icons-material/MarkunreadOutlined";
import { CounterpartAvatar } from "./CounterpartAvatar";

function buildRequisiteRows(counterpart) {
  const candidates = [
    { label: "Компания", value: counterpart?.companyName },
    { label: "БИН", value: counterpart?.bin },
    { label: "ИИН", value: counterpart?.iin },
    { label: "ФИО", value: counterpart?.fullName },
    { label: "БИК", value: counterpart?.bik },
    { label: "Расчетный счет", value: counterpart?.account },
    { label: "Адрес компании", value: counterpart?.address },
  ];

  return candidates.filter((row) => row.value);
}

function RequisitesTable({ rows }) {
  return (
    <TableContainer component={Box}>
      <Table size="small">
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.label}>
              <TableCell sx={{ width: "40%", color: "text.secondary", pl: 0 }}>
                {row.label}:
              </TableCell>

              <TableCell sx={{ fontWeight: 500, pr: 0 }}>{row.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function CounterpartDetailsModal({ open, counterpart, onClose }) {
  const [copied, setCopied] = useState(false);

  const rows = buildRequisiteRows(counterpart);
  const hasContactActions = Boolean(counterpart?.email || counterpart?.phone);

  async function handleCopyPhone(event) {
    event.stopPropagation();

    if (!counterpart?.phone) {
      return;
    }

    await navigator.clipboard.writeText(counterpart.phone);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
          },
        },
      }}
      sx={{ zIndex: (theme) => theme.zIndex.snackbar + 1 }}
    >
      <DialogTitle sx={{ px: 3, pt: 3, pb: 1.5 }}>
        {counterpart?.avatarUrl && (
          <Box sx={{ display: "flex", justifyContent: "center", mb: 1.5 }}>
            <CounterpartAvatar counterpart={counterpart} size={96} fontSize={32} />
          </Box>
        )}

        <Typography
          fontWeight={700}
          sx={{ textAlign: counterpart?.avatarUrl ? "center" : "left" }}
        >
          {counterpart?.name}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5, textAlign: counterpart?.avatarUrl ? "center" : "left" }}
        >
          {counterpart?.role}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 3 }}>
        {hasContactActions && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              mb: rows.length > 0 ? 2 : 0,
            }}
          >
            {counterpart?.email && (
              <Tooltip title={counterpart.email} placement="top" arrow>
                <Button
                  color="primary"
                  variant="contained"
                  component="a"
                  href={`mailto:${counterpart.email}`}
                  sx={{
                    boxShadow: 0,
                    fontSize: 12,
                    textTransform: "none",
                    justifyContent: "flex-start",
                  }}
                  startIcon={<MarkunreadOutlinedIcon sx={{ fontSize: 16 }} />}
                >
                  <Box
                    component="span"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {counterpart.email}
                  </Box>
                </Button>
              </Tooltip>
            )}

            {counterpart?.phone && (
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
                    fontSize: 12,
                    textTransform: "none",
                    justifyContent: "flex-start",
                  }}
                  startIcon={<PhoneOutlinedIcon sx={{ fontSize: 16 }} />}
                >
                  {counterpart.phone}
                </Button>
              </Tooltip>
            )}
          </Box>
        )}

        {rows.length > 0 && (
          <Box
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
              backgroundColor: "grey.50",
            }}
          >
            <Typography sx={{ fontSize: 15, fontWeight: 600, mb: 1.5 }}>
              Реквизиты
            </Typography>

            <RequisitesTable rows={rows} />
          </Box>
        )}

        {!hasContactActions && rows.length === 0 && (
          <Typography color="text.secondary" sx={{ fontSize: 13 }}>
            Контактные данные не указаны
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
}
