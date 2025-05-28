export const isValidRuetEmail = (email) => {
  const rollLength = 7;
  const regex = new RegExp(`^\\d{${rollLength}}@student\\.ruet\\.ac\\.bd$`);

  return regex.test(email);
}