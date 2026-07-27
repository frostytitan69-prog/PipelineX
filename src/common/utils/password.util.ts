import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePasswords = async (candidate: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(candidate, hash);
};
