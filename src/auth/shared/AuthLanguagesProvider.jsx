import { useEffect, useState } from "react";
import { getLanguages } from "../api/languages";
import { AuthLanguagesContext } from "./auth-languages.context";

export default function AuthLanguagesProvider({ role, children }) {
  const [state, setState] = useState({
    languages: [],
    loading: true,
    error: false,
  });

  useEffect(() => {
    const controller = new AbortController();

    getLanguages(role, controller.signal).then(
      (languages) => {
        if (!controller.signal.aborted) {
          setState({ languages, loading: false, error: false });
        }
      },
      () => {
        if (!controller.signal.aborted) {
          setState({ languages: [], loading: false, error: true });
        }
      },
    );

    return () => controller.abort();
  }, [role]);

  return (
    <AuthLanguagesContext.Provider value={state}>
      {children}
    </AuthLanguagesContext.Provider>
  );
}
