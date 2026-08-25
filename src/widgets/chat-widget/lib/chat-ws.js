import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { fetchLeadChatWsTokenApi } from "../api/chat.api";

window.Pusher = Pusher;

function getChatWsConfig() {
  return window.ChatWS_Config || null;
}

export function openLeadChatConnection({
  leadId,
  chatType = "lead",
  onMessageSent,
  onMessageUpdated,
  onMessageDeleted,
  onMessagesRead,
  onError,
}) {
  const abortController = new AbortController();

  let echo = null;
  let chatId = null;
  let isClosed = false;

  function warnAndReportError(message, error) {
    console.warn(message, error);
    onError?.(error);
  }

  async function start() {
    try {
      const config = getChatWsConfig();

      if (!config?.ws || !config?.key || !config?.auth) {
        console.warn(
          "ChatWS: window.ChatWS_Config is not configured — live chat updates skipped.",
        );
        return;
      }

      const tokenResponse = await fetchLeadChatWsTokenApi(leadId, chatType, {
        signal: abortController.signal,
      });

      if (isClosed) {
        return;
      }

      const token = tokenResponse?.token;
      chatId = tokenResponse?.chat_id;

      if (!token || !chatId) {
        throw new Error("ChatWS token endpoint did not return token/chat_id");
      }

      echo = new Echo({
        broadcaster: "reverb",
        key: config.key,
        wsHost: new URL(config.ws).hostname,
        wsPort: 443,
        wssPort: 443,
        forceTLS: true,
        enabledTransports: ["ws", "wss"],
        authEndpoint: config.auth,
        auth: { headers: { Authorization: `Bearer ${token}` } },
      });

      if (isClosed) {
        echo.disconnect();
        echo = null;
        return;
      }

      echo.connector?.pusher?.connection?.bind?.("error", (wsError) => {
        warnAndReportError(`ChatWS: connection error for lead ${leadId}`, wsError);
      });

      const channel = echo
        .private(`chats.${chatId}`)
        .listen(".message.sent", (event) => onMessageSent?.(event?.message))
        .listen(".message.updated", (event) => onMessageUpdated?.(event?.message))
        .listen(".message.deleted", (event) => onMessageDeleted?.(event?.message))
        .listen(".messages.read", (event) => onMessagesRead?.(event?.participant_id));

      try {
        channel?.error?.((subscriptionError) => {
          warnAndReportError(
            `ChatWS: subscription error for chat ${chatId}`,
            subscriptionError,
          );
        });
      } catch (bindError) {
        console.warn("ChatWS: could not bind channel error handler", bindError);
      }
    } catch (error) {
      if (error.name === "AbortError" || isClosed) {
        return;
      }

      warnAndReportError(`ChatWS: failed to open connection for lead ${leadId}`, error);
    }
  }

  start();

  return {
    close() {
      if (isClosed) {
        return;
      }

      isClosed = true;
      abortController.abort();

      if (echo) {
        try {
          echo.disconnect();
        } catch (error) {
          console.warn("ChatWS: error disconnecting", error);
        }
      }

      echo = null;
      chatId = null;
    },
  };
}
