import { useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";

import { useContractStore, attemptContractSigning } from "../../../shared/model/contract.store";
import { notifyError, notifyWarning } from "../../../shared/model/notifications.store";

function formatDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("ru-RU");
}

function classifySigningError(error) {
  const status = error.response?.status;
  const message = error.response?.data?.message;

  if (status === 422 || status === 502) {
    return "Не удалось начать подписание, попробуйте позже";
  }

  return message || error.message || "Не удалось начать подписание";
}

// TODO(backend): there's no real download endpoint for the signed contract
// yet, so this just surfaces a toast instead of fetching a file.
function handleDownload() {
  notifyWarning("Скачивание пока недоступно");
}

export function ContractDocumentCard() {
  const hasValidContract = useContractStore((state) => state.hasValidContract);
  const contractExpiresAt = useContractStore((state) => state.contractExpiresAt);

  const [isSigning, setIsSigning] = useState(false);

  const isSigned = hasValidContract === true;

  async function handleClick() {
    if (isSigned) {
      handleDownload();
      return;
    }

    if (isSigning) {
      return;
    }

    setIsSigning(true);

    try {
      const result = await attemptContractSigning();

      if (result.type === "already-signed") {
        setIsSigning(false);
      }

      // 'redirecting' leaves isSigning true — the tab is about to navigate away.
    } catch (error) {
      notifyError(classifySigningError(error));
      setIsSigning(false);
    }
  }

  const expiresLabel = formatDate(contractExpiresAt);

  return (
    <Box
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          handleClick();
        }
      }}
      sx={{
        p: 2,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        border: "1px solid",
        borderColor: isSigned ? "divider" : "warning.main",
        borderRadius: 2,
        backgroundColor: isSigned ? "background.paper" : "rgba(237, 108, 2, 0.04)",
        cursor: isSigning ? "default" : "pointer",
        opacity: isSigning ? 0.7 : 1,
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isSigned
            ? "rgba(46, 125, 50, 0.08)"
            : "rgba(237, 108, 2, 0.08)",
          flexShrink: 0,
        }}
      >
        {isSigning ? (
          <CircularProgress size={20} />
        ) : isSigned ? (
          <CheckCircleOutlineRoundedIcon color="success" fontSize="large" />
        ) : (
          <DescriptionOutlinedIcon color="warning" fontSize="large" />
        )}
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          Договор с сервисом
        </Typography>

        <Typography variant="caption" color="text.secondary">
          {isSigning
            ? "Открываем страницу подписания..."
            : isSigned
              ? `Подписан${expiresLabel ? ` · Действует до ${expiresLabel}` : ""}`
              : "Не подписан · нажмите, чтобы подписать"}
        </Typography>
      </Box>
    </Box>
  );
}
