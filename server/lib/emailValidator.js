export const isValidRuetEmail = (email) => {
  const patterns = [
    /^[0-9]+@student\.ruet\.ac\.bd$/i,   // RUET ->2010033@student.ruet.ac.bd
    /^s[0-9]+@ru\.ac\.bd$/i,             // RU ->s2310876102@ru.ac.bd
  ];

  return patterns.some((regex) => regex.test(email));
};
