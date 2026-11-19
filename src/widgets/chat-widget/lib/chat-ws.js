import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { fetchLeadChatWsTokenApi } from "../api/chat.api";

window.Pusher = Pusher;

function resolveChatWsConfig(tokenResponse) {
  const fallback = window.ChatWS_Config || {};

  return {
    ws: tokenResponse?.ws || fallback.ws || "",
    key: tokenResponse?.key || fallback.key || "",
    auth: tokenResponse?.auth || fallback.auth || "",
  };
}

function normalizeWsHost(value) {
  const rawHost = String(value || "").trim();

  if (!rawHost) {
    return "";
  }

  const hasProtocol = /^[a-z]+:\/\//i.test(rawHost);

  try {
    return new URL(hasProtocol ? rawHost : `wss://${rawHost}`).hostname;
  } catch {
    return rawHost.replace(/^\/+/, "").split("/")[0];
  }
}

const MAX_AUTH_RETRIES = 2;

function isChannelAuthError(subscriptionError) {
  const status = subscriptionError?.status;
  return (
    subscriptionError?.type === "AuthError" && (status === 401 || status === 403)
  );
}

export function openLeadChatConnection({
  leadId,
  chatType = "lead",
  fetchToken,
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
  let authRetryCount = 0;

  function warnAndReportError(message, error) {
    console.warn(message, error);
    onError?.(error);
  }

  function teardownEcho() {
    if (echo) {
      try {
        echo.disconnect();
      } catch (error) {
        console.warn("ChatWS: error disconnecting", error);
      }
    }

    echo = null;
    chatId = null;
  }

  async function start() {
    try {
      const tokenResponse = fetchToken
        ? await fetchToken({ signal: abortController.signal })
        : await fetchLeadChatWsTokenApi(leadId, chatType, {
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

      const config = resolveChatWsConfig(tokenResponse);

      if (!config.ws || !config.key || !config.auth) {
        console.warn(
          "ChatWS: no ws/key/auth in the chat token response or window.ChatWS_Config — live chat updates skipped.",
        );
        return;
      }

      echo = new Echo({
        broadcaster: "reverb",
        key: config.key,
        wsHost: normalizeWsHost(config.ws),
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
        .listen(".messages.read", (event) =>
          onMessagesRead?.(event?.participant_id, event?.last_read_message_id),
        );

      try {
        channel?.subscribed?.(() => {
          authRetryCount = 0;
        });
      } catch (bindError) {
        console.warn("ChatWS: could not bind channel subscribed handler", bindError);
      }

      try {
        channel?.error?.((subscriptionError) => {
          if (isClosed) {
            return;
          }

          if (isChannelAuthError(subscriptionError) && authRetryCount < MAX_AUTH_RETRIES) {
            authRetryCount += 1;
            console.warn(
              `ChatWS: channel auth failed for chat ${chatId} (status ${subscriptionError.status}), refetching token and reconnecting (attempt ${authRetryCount}/${MAX_AUTH_RETRIES})`,
              subscriptionError,
            );
            teardownEcho();
            start();
            return;
          }

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
      teardownEcho();
    },
  };
}
