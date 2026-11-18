import { Controller } from "react-hook-form";
import { useAuthTranslation } from "../i18n/useAuthTranslation";
import LanguageSelect from "./LanguageSelect";

export default function RegistrationLanguageSelect({ control }) {
  const { i18n } = useAuthTranslation();
  return (
    <Controller
      name="language"
      control={control}
      defaultValue={i18n.language}
      render={({ field, fieldState: { error } }) => (
        <LanguageSelect
          {...field}
          error={!!error}
          helperText={error?.message}
        />
      )}
    />
  );
}
