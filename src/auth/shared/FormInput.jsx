import { forwardRef, useState } from "react";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useAuthTranslation } from "../i18n/useAuthTranslation";

const FormInput = forwardRef(function FormInput({
  inputRef,
  type = "text",
  fullWidth = true,
  margin = "normal",
  slotProps,
  sx,
  helperText,
  ...props
}, ref) {
  const { t } = useAuthTranslation();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const fieldRef = inputRef ?? ref;
  const isPassword = type === "password";
  const isLeftToRight = ["email", "tel"].includes(type) ||
    ["email", "phone"].includes(props.name);

  return (
    <TextField
      {...props}
      helperText={t(helperText)}
      type={isPassword && passwordVisible ? "text" : type}
      fullWidth={fullWidth}
      margin={margin}
      inputRef={fieldRef}
      sx={[
        {
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            fontSize: "14px",
            "&.Mui-focused:not(.Mui-error) .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgb(24, 87, 196)",
            },
          },
          "& .MuiInputLabel-root": { fontSize: "14px" },
          "& .MuiInputLabel-root.Mui-focused:not(.Mui-error)": {
            color: "rgb(24, 87, 196)",
          },
          "& input": {
            caretColor: "rgb(24, 87, 196)",
            // Keep email/phone characters LTR while aligning them with RTL fields.
            textAlign: (theme) =>
              isLeftToRight && theme.direction === "rtl" ? "end" : "start",
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      slotProps={{
        ...slotProps,
        htmlInput: {
          ...(isLeftToRight ? { dir: "ltr" } : {}),
          ...slotProps?.htmlInput,
        },
        input: {
          ...slotProps?.input,
          ...(isPassword && {
            endAdornment: (
              <InputAdornment position="end">
                {slotProps?.input?.endAdornment}
                <IconButton
                  type="button"
                  edge="end"
                  tabIndex={-1}
                  aria-label={
                    passwordVisible ? t("Скрыть пароль") : t("Показать пароль")
                  }
                  onClick={() => setPasswordVisible((visible) => !visible)}
                >
                  {passwordVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }),
        },
      }}
    />
  );
});

export default FormInput;
