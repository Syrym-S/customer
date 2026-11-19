import { useAuthTranslation } from "../i18n/useAuthTranslation";
import { useState } from "react";
import { Button } from "@mui/material";
import { getEcpLoginUrlRequest } from "../api/auth";
import { isNative } from "../../shared/config/platform";
import { openExternalLink } from "../../shared/lib/external-link";
import {
  getEcpRequestErrorMessage,
  isEcpLoginEnabled,
} from "./ecp-login.helpers";

export function EcpLoginButton({ onError, disabled, sx }) {
  const { t } = useAuthTranslation();
  const [isRedirecting, setIsRedirecting] = useState(false);

  async function handleClick() {
    setIsRedirecting(true);
    onError?.("");

    try {
      const res = await getEcpLoginUrlRequest();
      const url = res?.data?.url;

      if (!url) {
        throw new Error("Missing ECP url");
      }

      if (isNative) {
        await openExternalLink(url);
        setIsRedirecting(false);
        return;
      }

      window.location.href = url;
    } catch (e) {
      setIsRedirecting(false);
      onError?.(getEcpRequestErrorMessage(e));
    }
  }

  if (!isEcpLoginEnabled()) {
    return null;
  }

  return (
    <Button
      fullWidth
      variant="outlined"
      onClick={handleClick}
      disabled={disabled || isRedirecting}
      sx={sx}
    >
      {isRedirecting ? t("Переход к подписанию...") : t("Войти по ЭЦП")}
    </Button>
  );
}
