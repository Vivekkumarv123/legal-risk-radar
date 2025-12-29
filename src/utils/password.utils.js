export const generatePassword = (name = "user") => {
  const cleanName = String(name).replace(/\s+/g, "").slice(0, 10);
  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  const specialChars = ["@", "!", "#", "$"];
  const special = specialChars[Math.floor(Math.random() * specialChars.length)];

  return `${cleanName}${randomNumber}${special}`;
};

export default generatePassword;
