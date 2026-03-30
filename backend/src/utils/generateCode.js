export const generateReadableCode = (prefix, serial) => {
  return `${prefix}${String(serial).padStart(3, "0")}`;
};

export const generateTxnCode = (serial) => {
  return `TRX${String(serial).padStart(4, "0")}`;
};
