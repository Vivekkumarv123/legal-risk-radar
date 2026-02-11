export const generatePassword = (name = "user") => {
  const cleanName = String(name).replace(/\s+/g, "").slice(0, 6);
  const randomNumber = Math.floor(10000 + Math.random() * 90000); // 5 digits
  const specialChars = ["@", "!", "#", "$", "%", "&", "*"];
  const special = specialChars[Math.floor(Math.random() * specialChars.length)];
  const extraSpecial = specialChars[Math.floor(Math.random() * specialChars.length)];

  // Ensure minimum 8 characters, ideal 12-16
  const password = `${cleanName}${randomNumber}${special}${extraSpecial}`;
  
  // Pad if too short (shouldn't happen but safety check)
  if (password.length < 8) {
    const padding = Math.floor(1000 + Math.random() * 9000);
    return `${password}${padding}`;
  }
  
  return password;
};

export const validatePassword = (password) => {
  if (!password) return { valid: false, message: "Password is required" };
  if (password.length < 8) return { valid: false, message: "Password must be at least 8 characters" };
  if (password.length > 16) return { valid: false, message: "Password must not exceed 16 characters" };
  
  // Check for at least one number
  if (!/\d/.test(password)) return { valid: false, message: "Password must contain at least one number" };
  
  // Check for at least one special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return { valid: false, message: "Password must contain at least one special character" };
  
  return { valid: true, message: "Password is valid" };
};

export default generatePassword;
