// Helper para detectar idioma desde la URL y devolver el equivalente en el otro idioma.
// Convención: /en/* = inglés, todo lo demás = español (default).

export type Lang = "es" | "en";

export function getLang(url: URL): Lang {
  return url.pathname.startsWith("/en") ? "en" : "es";
}

// Mapeo de paths entre idiomas. Si una página no está aquí, asumimos que es la misma ruta.
const PATH_MAP: Record<string, string> = {
  "/": "/en/",
  "/nosotros": "/en/about",
  "/que-hacemos": "/en/what-we-do",
  "/impacto": "/en/impact",
  "/sumate": "/en/get-involved",
  "/contacto": "/en/contact",
  "/fotos": "/en/photos",
  "/privacidad": "/en/privacy",
  "/terminos": "/en/terms",
  "/lo-que-creemos": "/en/what-we-believe",
  "/para-iglesias": "/en/for-churches",
};

const REVERSE_PATH_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(PATH_MAP).map(([es, en]) => [en, es])
);

// Dado el path actual, devuelve el path equivalente en el otro idioma.
export function getAlternatePath(pathname: string): string {
  // Normalizar (quitar trailing slash excepto root)
  const normalized = pathname.length > 1 && pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;

  if (normalized.startsWith("/en")) {
    // Estamos en inglés → buscar el equivalente español
    const enPath = normalized === "/en" ? "/en/" : normalized;
    return REVERSE_PATH_MAP[enPath] || "/";
  }

  // Estamos en español → buscar el equivalente inglés
  return PATH_MAP[normalized] || "/en/";
}
