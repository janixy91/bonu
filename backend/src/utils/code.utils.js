import Code from '../models/Code.model.js';

/**
 * Generate a random alphanumeric code (6-10 characters)
 * @param {number} length - Length of the code (default: random between 6-10)
 * @returns {string} Random uppercase alphanumeric code
 */
export const generateRandomCode = (length = null) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const codeLength = length || Math.floor(Math.random() * 5) + 6; // Random between 6-10
  
  let code = '';
  for (let i = 0; i < codeLength; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
};

/**
 * Generate a unique code that doesn't exist in the database
 * @param {number} maxAttempts - Maximum attempts to generate unique code (default: 100)
 * @returns {Promise<string>} Unique code
 */
export const generateUniqueCode = async (maxAttempts = 100) => {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const code = generateRandomCode();
    
    // Check if code already exists
    const existingCode = await Code.findOne({ code });
    
    if (!existingCode) {
      return code;
    }
    
    attempts++;
  }
  
  throw new Error('No se pudo generar un código único después de múltiples intentos');
};

/**
 * Generate multiple unique codes
 * @param {number} count - Number of codes to generate
 * @returns {Promise<string[]>} Array of unique codes
 */
export const generateMultipleUniqueCodes = async (count) => {
  const codes = [];
  
  for (let i = 0; i < count; i++) {
    const code = await generateUniqueCode();
    codes.push(code);
  }
  
  return codes;
};

