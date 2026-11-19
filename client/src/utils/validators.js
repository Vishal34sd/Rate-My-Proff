export const KIET_ERROR_MSG =
  "Please use your KIET institutional email address ending with @kiet.edu.";

export const KIET_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@kiet\.edu$/i;

/**
 * Validates strictly that an email is a genuine KIET institutional address.
 * Rejects all other domains (@gmail.com, @kiet.ac.in, @fakekiet.edu, etc.)
 */
export const validateKietEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  const normalized = email.trim().toLowerCase();
  if (!KIET_EMAIL_REGEX.test(normalized)) return false;
  const parts = normalized.split("@");
  return parts.length === 2 && parts[1] === "kiet.edu" && parts[0].length > 0;
};

export const normalizeEmail = (email) => {
  if (!email || typeof email !== "string") return "";
  return email.trim().toLowerCase();
};

export const validateOtpFormat = (otp) => {
  if (!otp || typeof otp !== "string") return false;
  return /^\d{6}$/.test(otp.trim());
};
