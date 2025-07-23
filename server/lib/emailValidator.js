export const isValidRuetEmail = (email) => {
  const regex = /^[\w.-]+@([\w-]+\.)?ruet\.ac\.bd$/i;
  return regex.test(email);
};
