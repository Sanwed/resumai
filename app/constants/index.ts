export const MIN_PASSWORD_LENGTH = 8;
export const MAX_AVATAR_FILE_SIZE = 2 * 1024 * 1024;
export const MAX_RESUME_FILE_SIZE = 3 * 1024 * 1024;
export const MINIMAL_ANALYSIS_COST = 30;
export const TOKEN_COEFFICIENT = 500;

export const Providers = {
  CREDENTIAL: 'credential',
  GOOGLE: 'google',
  GITHUB: 'github',
  LINKEDIN: 'linkedin',
} as const;

export const AvailableFileFormats = {
  PDF: 'application/pdf',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  DOC: 'application/msword',
  TXT: 'text/plain',
  JPG: 'image/jpeg',
  PNG: 'image/png',
} as const;
