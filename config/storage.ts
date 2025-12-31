export const STORAGE_BUCKETS = {
  PROJETOS: "projetos", // Deprecated
  CAMARA: "camara",
} as const;

export const STORAGE_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_MIME_TYPES: ["application/pdf"],
};
