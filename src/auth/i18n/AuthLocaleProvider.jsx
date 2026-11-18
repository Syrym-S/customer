import { AuthLocaleContext } from "./auth-locale.context";
import AuthLanguagesProvider from "../shared/AuthLanguagesProvider";
import AuthDirectionProvider from "./AuthDirectionProvider";

export default function AuthLocaleProvider({ role, children }) {
  return (
    <AuthLocaleContext.Provider value={true}>
      <AuthDirectionProvider>
        <AuthLanguagesProvider role={role}>{children}</AuthLanguagesProvider>
      </AuthDirectionProvider>
    </AuthLocaleContext.Provider>
  );
}
