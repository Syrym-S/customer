import { createContext } from "react";

export const AuthLanguagesContext = createContext({
  languages: [],
  loading: true,
  error: false,
});
