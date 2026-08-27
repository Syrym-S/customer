import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import { useChatStore } from "../model/chat.store";
import { CHAT_ROLE_ID, CHAT_ROLE_LABEL_BY_ID } from "../model/chat.mappers";
import {
  CHAT_ATTACHMENT_MAX_COUNT,
  formatFileSize,
  formatRelativeTime,
  getLoadedMessages,
  hasMoreMessages,
  isImageAttachment,
  validateChatAttachmentFile,
} from "../model/chat.helpers";
import { createMockAttachmentId } from "../model/chat.mock";
import { fetchLeadChatAttachmentBlobApi } from "../api/chat.api";
import { openLeadChatConnection } from "../lib/chat-ws";
import { notifyError } from "../../../shared/model/notifications.store";
import { CounterpartDetailsModal } from "./CounterpartDetailsModal";
import { CounterpartAvatar } from "./CounterpartAvatar";

const LOAD_OLDER_SCROLL_THRESHOLD_PX = 80;

const FACTORING_SENDER_NAME_COLOR_BY_ROLE_ID = {
  [CHAT_ROLE_ID.FORWARDER]: "secondary.main",
  [CHAT_ROLE_ID.FACTOR]: "success.main",
};

const FACTORING_SENDER_RELABEL_INTERVAL = 8;

// Grouping key is role_id (forwarder/factor are the only two non-own senders).
function computeFactoringSenderLabelFlags(messages) {
  const shouldShowLabel = new Array(messages.length).fill(false);
  let previousRoleId = undefined;
  let sinceLastLabel = 0;

  messages.forEach((message, index) => {
    if (message.authorType === "me") {
      previousRoleId = undefined;
      sinceLastLabel = 0;
      return;
    }

    const roleId = message.participantRoleId;

    if (roleId !== previousRoleId) {
      shouldShowLabel[index] = true;
      previousRoleId = roleId;
      sinceLastLabel = 0;
      return;
    }

    sinceLastLabel += 1;

    if (sinceLastLabel >= FACTORING_SENDER_RELABEL_INTERVAL) {
      shouldShowLabel[index] = true;
      sinceLastLabel = 0;
    }
  });

  return shouldShowLabel;
}

function isServerBackedAttachment(attachment) {
  return Boolean(attachment?.leadId);
}

function useAttachmentObjectUrl(attachment, { enabled }) {
  const [objectUrl, setObjectUrl] = useState(null);
  const [status, setStatus] = useState(enabled ? "loading" : "idle");

  useEffect(() => {
    if (!enabled || !attachment) {
      setObjectUrl(null);
      setStatus("idle");
      return undefined;
    }

    let cancelled = false;
    let createdUrl = null;

    setStatus("loading");
    setObjectUrl(null);

    fetchLeadChatAttachmentBlobApi(attachment.leadId, attachment.id, attachment.chatType)
      .then((blob) => {
        if (cancelled) {
          return;
        }

        createdUrl = URL.createObjectURL(blob);
        setObjectUrl(createdUrl);
        setStatus("loaded");
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        setStatus("error");
        notifyError(
          error.response?.data?.message ||
            error.message ||
            `Не удалось загрузить файл "${attachment.fileName}"`,
        );
      });

    return () => {
      cancelled = true;

      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, attachment?.leadId, attachment?.id, attachment?.chatType]);

  return { objectUrl, status };
}

function ServerImageAttachment({ attachment, onOpen }) {
  const { objectUrl, status } = useAttachmentObjectUrl(attachment, { enabled: true });

  if (status === "error") {
    return (
      <Box
        sx={{
          width: 220,
          height: 120,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0.5,
          borderRadius: 1.5,
          backgroundColor: "rgba(0,0,0,0.04)",
        }}
      >
        <InsertDriveFileOutlinedIcon fontSize="small" color="disabled" />
        <Typography sx={{ fontSize: 11 }} color="text.secondary">
          Не удалось загрузить
        </Typography>
      </Box>
    );
  }

  if (status !== "loaded" || !objectUrl) {
    return (
      <Box
        sx={{
          width: 220,
          height: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 1.5,
          backgroundColor: "rgba(0,0,0,0.04)",
        }}
      >
        <CircularProgress size={20} />
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={objectUrl}
      alt={attachment.fileName}
      onClick={() => onOpen(attachment)}
      sx={{
        display: "block",
        maxWidth: 220,
        maxHeight: 160,
        borderRadius: 1.5,
        cursor: "pointer",
        objectFit: "cover",
      }}
    />
  );
}

function ServerFileAttachment({ attachment, isMine }) {
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload() {
    if (isDownloading) {
      return;
    }

    setIsDownloading(true);

    try {
      const blob = await fetchLeadChatAttachmentBlobApi(
        attachment.leadId,
        attachment.id,
        attachment.chatType,
      );
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = objectUrl;
      link.download = attachment.fileName || "";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      notifyError(
        error.response?.data?.message ||
          error.message ||
          `Не удалось скачать файл "${attachment.fileName}"`,
      );
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <Box
      component="button"
      type="button"
      onClick={handleDownload}
      disabled={isDownloading}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 1,
        py: 0.75,
        border: "none",
        borderRadius: 1.5,
        textDecoration: "none",
        color: "inherit",
        font: "inherit",
        textAlign: "left",
        cursor: isDownloading ? "default" : "pointer",
        backgroundColor: isMine ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.04)",
        opacity: isDownloading ? 0.7 : 1,
      }}
    >
      {isDownloading ? (
        <CircularProgress size={16} sx={{ color: "inherit" }} />
      ) : (
        <InsertDriveFileOutlinedIcon fontSize="small" />
      )}

      <Box sx={{ minWidth: 0 }}>
        <Typography
          noWrap
          sx={{ fontSize: 12, fontWeight: 600, maxWidth: 160 }}
          title={attachment.fileName}
        >
          {attachment.fileName}
        </Typography>
        {formatFileSize(attachment.size) && (
          <Typography
            sx={{
              fontSize: 10,
              color: isMine ? "rgba(255,255,255,0.75)" : "text.secondary",
            }}
          >
            {formatFileSize(attachment.size)}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export function ChatDetailView({ chat }) {
  const backToList = useChatStore((state) => state.backToList);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const loadOlderMessages = useChatStore((state) => state.loadOlderMessages);
  const deleteLeadMessage = useChatStore((state) => state.deleteLeadMessage);
  const editLeadMessage = useChatStore((state) => state.editLeadMessage);
  const receiveLeadMessageSent = useChatStore((state) => state.receiveLeadMessageSent);
  const receiveLeadMessageUpdated = useChatStore((state) => state.receiveLeadMessageUpdated);
  const receiveLeadMessageDeleted = useChatStore((state) => state.receiveLeadMessageDeleted);
  const receiveLeadMessagesRead = useChatStore((state) => state.receiveLeadMessagesRead);
  const reportChatWsError = useChatStore((state) => state.reportChatWsError);
  const pagination = useChatStore((state) => state.chatPagination[chat.id]);

  const isFactoring = chat.entityType === "factoring";
  const isRealChat =
    chat.entityType === "lead" || isFactoring || chat.entityType === "delivery";

  const headerCounterpart = chat.counterparts?.[0] || chat.counterpart;

  const [draft, setDraft] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState([]);
  const [lightboxAttachment, setLightboxAttachment] = useState(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactModalCounterpart, setContactModalCounterpart] = useState(null);
  const [messagePendingDeletion, setMessagePendingDeletion] = useState(null);
  const [isDeletingMessage, setIsDeletingMessage] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingDraft, setEditingDraft] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const pendingScrollAdjustRef = useRef(null);

  function handleOpenContactModal(counterpart) {
    setContactModalCounterpart(counterpart || chat.counterpart);
    setIsContactModalOpen(true);
  }

  function handleCloseContactModal() {
    setIsContactModalOpen(false);
  }

  async function handleConfirmDeleteMessage() {
    if (!messagePendingDeletion) {
      return;
    }

    setIsDeletingMessage(true);

    try {
      await deleteLeadMessage(chat.entityId, messagePendingDeletion.id, chat.entityType);
    } finally {
      setIsDeletingMessage(false);
      setMessagePendingDeletion(null);
    }
  }

  function handleStartEditMessage(message) {
    setEditingMessageId(message.id);
    setEditingDraft(message.text);
  }

  function handleCancelEditMessage() {
    setEditingMessageId(null);
    setEditingDraft("");
  }

  async function handleSaveEditMessage() {
    if (!editingDraft.trim() || isSavingEdit) {
      return;
    }

    setIsSavingEdit(true);

    try {
      await editLeadMessage(chat.entityId, editingMessageId, editingDraft, chat.entityType);
    } finally {
      setIsSavingEdit(false);
      setEditingMessageId(null);
      setEditingDraft("");
    }
  }

  function handleEditKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSaveEditMessage();
    } else if (event.key === "Escape") {
      event.preventDefault();
      handleCancelEditMessage();
    }
  }

  useEffect(() => {
    setIsContactModalOpen(false);
    setLightboxAttachment(null);
    setMessagePendingDeletion(null);
    setEditingMessageId(null);
    setEditingDraft("");
  }, [chat.id]);

  useEffect(() => {
    if (!editingMessageId) {
      return;
    }

    const editedMessage = chat.messages.find((message) => message.id === editingMessageId);

    if (editedMessage?.isDeleted) {
      setEditingMessageId(null);
      setEditingDraft("");
    }
  }, [chat.messages, editingMessageId]);

  useEffect(() => {
    if (!isRealChat) {
      return undefined;
    }

    const connection = openLeadChatConnection({
      leadId: chat.apiEntityId ?? chat.entityId,
      chatType: chat.entityType,
      onMessageSent: (message) => receiveLeadMessageSent(chat.entityId, message, chat.entityType),
      onMessageUpdated: (message) =>
        receiveLeadMessageUpdated(chat.entityId, message, chat.entityType),
      onMessageDeleted: (message) =>
        receiveLeadMessageDeleted(chat.entityId, message, chat.entityType),
      onMessagesRead: (participantId, lastReadMessageId) =>
        receiveLeadMessagesRead(chat.entityId, participantId, lastReadMessageId, chat.entityType),
      onError: (error) => reportChatWsError(chat.entityId, error, chat.entityType),
    });

    return () => {
      connection.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.entityId, chat.entityType, isRealChat]);

  const lightboxIsServerBacked = isServerBackedAttachment(lightboxAttachment);
  const { objectUrl: lightboxObjectUrl, status: lightboxStatus } = useAttachmentObjectUrl(
    lightboxAttachment,
    { enabled: lightboxIsServerBacked },
  );
  const lightboxDisplayUrl = lightboxIsServerBacked
    ? lightboxObjectUrl
    : lightboxAttachment?.fileUrl;

  const loadedMessages = getLoadedMessages(chat, pagination);
  const hasMore = hasMoreMessages(chat, pagination);
  const isLoadingMore = pagination?.isLoadingMore ?? false;
  const lastMessageId = loadedMessages[loadedMessages.length - 1]?.id;
  const factoringSenderLabelFlags = isFactoring
    ? computeFactoringSenderLabelFlags(loadedMessages)
    : null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [chat.id, lastMessageId]);

  useLayoutEffect(() => {
    const adjustment = pendingScrollAdjustRef.current;
    const container = scrollContainerRef.current;

    if (!adjustment || !container) {
      return;
    }

    container.scrollTop =
      container.scrollHeight - adjustment.scrollHeight + adjustment.scrollTop;
    pendingScrollAdjustRef.current = null;
  }, [loadedMessages.length]);

  useEffect(() => {
    pendingScrollAdjustRef.current = null;
  }, [chat.id]);

  function handleScroll(event) {
    if (!hasMore || isLoadingMore) {
      return;
    }

    const container = event.currentTarget;

    if (container.scrollTop > LOAD_OLDER_SCROLL_THRESHOLD_PX) {
      return;
    }

    pendingScrollAdjustRef.current = {
      scrollHeight: container.scrollHeight,
      scrollTop: container.scrollTop,
    };

    loadOlderMessages(chat.id);
  }

  function handleFilesSelected(event) {
    const files = Array.from(event.target.files || []);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (files.length === 0) {
      return;
    }

    setPendingAttachments((prevAttachments) => {
      const nextAttachments = [...prevAttachments];

      for (const file of files) {
        if (nextAttachments.length >= CHAT_ATTACHMENT_MAX_COUNT) {
          notifyError(
            `Можно прикрепить не более ${CHAT_ATTACHMENT_MAX_COUNT} файлов к одному сообщению`,
          );
          break;
        }

        const validationError = validateChatAttachmentFile(file);

        if (validationError) {
          notifyError(validationError);
          continue;
        }

        nextAttachments.push({
          id: createMockAttachmentId(),
          fileName: file.name,
          fileType: file.type,
          size: file.size,
          fileUrl: URL.createObjectURL(file),
          file,
        });
      }

      return nextAttachments;
    });
  }

  function handleRemovePendingAttachment(attachmentId) {
    setPendingAttachments((prevAttachments) => {
      const target = prevAttachments.find(
        (attachment) => attachment.id === attachmentId,
      );

      if (target) {
        URL.revokeObjectURL(target.fileUrl);
      }

      return prevAttachments.filter(
        (attachment) => attachment.id !== attachmentId,
      );
    });
  }

  function handleSend() {
    if (!draft.trim() && pendingAttachments.length === 0) {
      return;
    }

    sendMessage(chat.id, draft, pendingAttachments);
    setDraft("");
    setPendingAttachments([]);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  const canSend = Boolean(draft.trim()) || pendingAttachments.length > 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1,
          py: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        <IconButton size="small" onClick={backToList} aria-label="Назад к списку чатов">
          <ArrowBackRoundedIcon fontSize="small" />
        </IconButton>

        {chat.entityType === "factoring" && chat.counterparts?.length > 1 ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, minWidth: 0, flex: 1 }}>
            {chat.counterparts.map((counterpart, index) => (
              <Box
                key={`${counterpart.name}-${index}`}
                onClick={() => handleOpenContactModal(counterpart)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  minWidth: 0,
                  cursor: "pointer",
                  borderRadius: 1,
                  px: 0.5,
                  mx: -0.5,
                  "&:hover": { backgroundColor: "action.hover" },
                }}
              >
                <CounterpartAvatar counterpart={counterpart} size={24} fontSize={11} />

                <Box sx={{ minWidth: 0 }}>
                  <Typography noWrap sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>
                    {counterpart.name}
                  </Typography>
                  <Typography color="text.secondary" sx={{ fontSize: 10, lineHeight: 1.2 }}>
                    {counterpart.role}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Box
            onClick={() => handleOpenContactModal(headerCounterpart)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              minWidth: 0,
              cursor: "pointer",
              borderRadius: 1,
              px: 0.5,
              mx: -0.5,
              "&:hover": { backgroundColor: "action.hover" },
            }}
          >
            <CounterpartAvatar counterpart={headerCounterpart} size={36} />

            <Box sx={{ minWidth: 0 }}>
              <Typography noWrap sx={{ fontSize: 14, fontWeight: 600 }}>
                {headerCounterpart.name}
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: 11 }}>
                {headerCounterpart.role}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      <Box
        ref={scrollContainerRef}
        onScroll={handleScroll}
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          px: 1.5,
          py: 1.5,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {isLoadingMore && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
            <CircularProgress size={20} />
          </Box>
        )}

        {!hasMore && !isLoadingMore && loadedMessages.length > 0 && (
          <Typography
            color="text.secondary"
            sx={{ fontSize: 11, textAlign: "center", py: 0.5 }}
          >
            Начало переписки
          </Typography>
        )}

        {loadedMessages.map((message, index) => {
          const isMine = message.authorType === "me";
          const isDeleted = Boolean(message.isDeleted);

          const senderCounterpart =
            isFactoring && !isMine
              ? chat.counterparts?.find(
                  (counterpart) => counterpart.roleId === message.participantRoleId,
                )
              : null;
          const senderLabel =
            isFactoring && !isMine
              ? senderCounterpart?.name ||
                CHAT_ROLE_LABEL_BY_ID[message.participantRoleId] ||
                null
              : null;
          const showSenderLabel = senderLabel && Boolean(factoringSenderLabelFlags?.[index]);

          return (
            <Box
              key={message.id}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: isMine ? "flex-end" : "flex-start",
                mt: isFactoring && !isMine && !showSenderLabel ? -0.5 : 0,
              }}
            >
              {showSenderLabel && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.25, px: 0.5 }}>
                  <CounterpartAvatar counterpart={senderCounterpart} size={18} fontSize={9} />
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 700,
                      color:
                        FACTORING_SENDER_NAME_COLOR_BY_ROLE_ID[message.participantRoleId] ||
                        "text.secondary",
                    }}
                  >
                    {senderLabel}
                  </Typography>
                </Box>
              )}

              <Box
                sx={{
                  position: "relative",
                  maxWidth: "78%",
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                  backgroundColor: isMine ? "primary.main" : "grey.100",
                  color: isMine ? "primary.contrastText" : "text.primary",
                  "&:hover .chat-message-actions": {
                    opacity:
                      isMine && isRealChat && !isDeleted && editingMessageId !== message.id
                        ? 1
                        : 0,
                  },
                }}
              >
                {isMine && isRealChat && !isDeleted && editingMessageId !== message.id && (
                  <Box
                    className="chat-message-actions"
                    sx={{
                      position: "absolute",
                      top: -12,
                      right: -12,
                      display: "flex",
                      gap: 0.25,
                      opacity: 0,
                      transition: "opacity 0.15s",
                      backgroundColor: "background.paper",
                      borderRadius: 4,
                      boxShadow: 1,
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => handleStartEditMessage(message)}
                      aria-label="Редактировать сообщение"
                      sx={{ color: "text.secondary", p: 0.4 }}
                    >
                      <EditOutlinedIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setMessagePendingDeletion(message)}
                      aria-label="Удалить сообщение"
                      sx={{ color: "text.secondary", p: 0.4 }}
                    >
                      <DeleteOutlineRoundedIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Box>
                )}

                {isDeleted ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontStyle: "italic",
                        color: isMine ? "rgba(255,255,255,0.75)" : "text.disabled",
                      }}
                    >
                      Сообщение удалено
                    </Typography>
                  </Box>
                ) : (
                  <>
                    {message.attachments?.length > 0 && (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.75,
                          mb: message.text ? 0.75 : 0,
                        }}
                      >
                        {message.attachments.map((attachment) => {
                          const isServerBacked = isServerBackedAttachment(attachment);

                          if (isImageAttachment(attachment)) {
                            return isServerBacked ? (
                              <ServerImageAttachment
                                key={attachment.id}
                                attachment={attachment}
                                onOpen={setLightboxAttachment}
                              />
                            ) : (
                              <Box
                                key={attachment.id}
                                component="img"
                                src={attachment.fileUrl}
                                alt={attachment.fileName}
                                onClick={() => setLightboxAttachment(attachment)}
                                sx={{
                                  display: "block",
                                  maxWidth: 220,
                                  maxHeight: 160,
                                  borderRadius: 1.5,
                                  cursor: "pointer",
                                  objectFit: "cover",
                                }}
                              />
                            );
                          }

                          if (isServerBacked) {
                            return (
                              <ServerFileAttachment
                                key={attachment.id}
                                attachment={attachment}
                                isMine={isMine}
                              />
                            );
                          }

                          return (
                            <Box
                              key={attachment.id}
                              component="a"
                              href={attachment.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              download={attachment.fileName}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                px: 1,
                                py: 0.75,
                                borderRadius: 1.5,
                                textDecoration: "none",
                                color: "inherit",
                                backgroundColor: isMine
                                  ? "rgba(255,255,255,0.15)"
                                  : "rgba(0,0,0,0.04)",
                              }}
                            >
                              <InsertDriveFileOutlinedIcon fontSize="small" />

                              <Box sx={{ minWidth: 0 }}>
                                <Typography
                                  noWrap
                                  sx={{ fontSize: 12, fontWeight: 600, maxWidth: 160 }}
                                  title={attachment.fileName}
                                >
                                  {attachment.fileName}
                                </Typography>
                                {formatFileSize(attachment.size) && (
                                  <Typography
                                    sx={{
                                      fontSize: 10,
                                      color: isMine
                                        ? "rgba(255,255,255,0.75)"
                                        : "text.secondary",
                                    }}
                                  >
                                    {formatFileSize(attachment.size)}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    )}

                    {editingMessageId === message.id ? (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                        <TextField
                          value={editingDraft}
                          onChange={(event) => setEditingDraft(event.target.value)}
                          onKeyDown={handleEditKeyDown}
                          autoFocus
                          size="small"
                          fullWidth
                          multiline
                          maxRows={4}
                          disabled={isSavingEdit}
                          sx={{
                            backgroundColor: "background.paper",
                            borderRadius: 1,
                            "& .MuiInputBase-input": { fontSize: 13, color: "text.primary" },
                          }}
                        />
                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={handleCancelEditMessage}
                            disabled={isSavingEdit}
                            aria-label="Отменить редактирование"
                            sx={{
                              color: isMine ? "primary.contrastText" : "text.secondary",
                              p: 0.4,
                            }}
                          >
                            <CloseRoundedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={handleSaveEditMessage}
                            disabled={isSavingEdit || !editingDraft.trim()}
                            aria-label="Сохранить изменения"
                            sx={{
                              color: isMine ? "primary.contrastText" : "text.secondary",
                              p: 0.4,
                            }}
                          >
                            <CheckRoundedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                      </Box>
                    ) : (
                      message.text && (
                        <Typography sx={{ fontSize: 13, whiteSpace: "pre-wrap" }}>
                          {message.text}
                        </Typography>
                      )
                    )}
                  </>
                )}

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: 0.4,
                    mt: 0.5,
                  }}
                >
                  {isMine && !isDeleted && message.isViewed === true && (
                    <Tooltip title="Прочитано" placement="top" arrow>
                      <DoneAllRoundedIcon
                        sx={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}
                      />
                    </Tooltip>
                  )}

                  <Typography
                    sx={{
                      fontSize: 10,
                      textAlign: "right",
                      color: isMine ? "rgba(255,255,255,0.75)" : "text.disabled",
                    }}
                  >
                    {formatRelativeTime(message.createdAt)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
        })}

        <div ref={messagesEndRef} />
      </Box>

      <Box
        sx={{
          borderTop: "1px solid",
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        {pendingAttachments.length > 0 && (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 0.75,
              px: 1.5,
              pt: 1.25,
            }}
          >
            {pendingAttachments.map((attachment) => (
              <Box
                key={attachment.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  pl: 0.75,
                  pr: 0.5,
                  py: 0.5,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 4,
                  backgroundColor: "grey.50",
                  maxWidth: "100%",
                }}
              >
                {isImageAttachment(attachment) ? (
                  <Box
                    component="img"
                    src={attachment.fileUrl}
                    alt={attachment.fileName}
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: "4px",
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <InsertDriveFileOutlinedIcon
                    sx={{ fontSize: 16, color: "text.secondary", flexShrink: 0 }}
                  />
                )}

                <Typography
                  noWrap
                  sx={{ fontSize: 11, maxWidth: 110 }}
                  title={attachment.fileName}
                >
                  {attachment.fileName}
                </Typography>

                <IconButton
                  size="small"
                  onClick={() => handleRemovePendingAttachment(attachment.id)}
                  aria-label={`Убрать файл ${attachment.fileName}`}
                  sx={{ p: 0.25 }}
                >
                  <CloseRoundedIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.5,
            py: 1.5,
          }}
        >
          <IconButton
            component="label"
            size="small"
            aria-label="Прикрепить файл"
            sx={{ mt: -0.2 }}
          >
            <AttachFileRoundedIcon fontSize="small" />

            <input
              ref={fileInputRef}
              hidden
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx,image/jpeg,image/png,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFilesSelected}
            />
          </IconButton>

          <TextField
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Сообщение..."
            size="small"
            fullWidth
            multiline
            maxRows={4}
          />

          <IconButton
            color="primary"
            size="small"
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Отправить сообщение"
          >
            <SendRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Dialog
        open={Boolean(lightboxAttachment)}
        onClose={() => setLightboxAttachment(null)}
        maxWidth="md"
        sx={{ zIndex: (theme) => theme.zIndex.snackbar + 1 }}
      >
        <Box
          sx={{
            position: "relative",
            lineHeight: 0,
            minWidth: lightboxIsServerBacked && lightboxStatus !== "loaded" ? 240 : undefined,
            minHeight: lightboxIsServerBacked && lightboxStatus !== "loaded" ? 240 : undefined,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconButton
            onClick={() => setLightboxAttachment(null)}
            aria-label="Закрыть просмотр изображения"
            sx={{
              position: "absolute",
              top: 4,
              right: 4,
              backgroundColor: "rgba(0,0,0,0.5)",
              color: "common.white",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.65)" },
            }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>

          {lightboxIsServerBacked && lightboxStatus === "loading" && (
            <CircularProgress size={28} sx={{ color: "common.white", m: 4 }} />
          )}

          {lightboxIsServerBacked && lightboxStatus === "error" && (
            <Typography sx={{ color: "common.white", p: 4 }}>
              Не удалось загрузить изображение
            </Typography>
          )}

          {lightboxDisplayUrl && (
            <Box
              component="img"
              src={lightboxDisplayUrl}
              alt="Просмотр вложения"
              sx={{ display: "block", maxWidth: "100%", maxHeight: "80vh" }}
            />
          )}
        </Box>
      </Dialog>

      <CounterpartDetailsModal
        open={isContactModalOpen}
        counterpart={contactModalCounterpart || headerCounterpart}
        onClose={handleCloseContactModal}
      />

      <Dialog
        open={Boolean(messagePendingDeletion)}
        onClose={() => setMessagePendingDeletion(null)}
        sx={{ zIndex: (theme) => theme.zIndex.snackbar + 1 }}
      >
        <DialogTitle>Удалить сообщение</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Сообщение будет удалено безвозвратно. Продолжить?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setMessagePendingDeletion(null)} disabled={isDeletingMessage}>
            Отмена
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDeleteMessage}
            disabled={isDeletingMessage}
          >
            {isDeletingMessage ? "Удаление..." : "Удалить"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
