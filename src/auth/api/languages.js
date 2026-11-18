import { api } from "./client";

export async function getLanguages(role, signal) {
  const languages = [];
  let page = 1;

  while (true) {
    const { data } = await api.get(`/${role}/v1/languages`, {
      baseURL: api.defaults.baseURL || "/wp-json/",
      params: { page, per_page: 20 },
      signal,
    });

    const results = Array.isArray(data) ? data : data?.results;

    if (!Array.isArray(results)) {
      throw new Error("Invalid languages response");
    }

    languages.push(...results);

    if (
      Array.isArray(data) ||
      results.length === 0 ||
      (data.count != null
        ? languages.length >= Number(data.count)
        : results.length < Number(data.per_page || 20))
    ) {
      break;
    }

    page += 1;
  }

  return [...new Map(
    languages
      .filter((language) =>
        language && language.is_active !== false && language.code && language.name,
      )
      .map((language) => [language.code, language]),
  ).values()];
}
