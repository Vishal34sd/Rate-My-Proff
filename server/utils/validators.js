

export const validateString = (value) => {
  if (!value || typeof value !== "string") return false;
  return value.trim().length > 0;
};