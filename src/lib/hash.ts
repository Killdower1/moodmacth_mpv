import bcrypt from "bcryptjs";

export async function hashPassword(pwd: string): Promise<string> {
  return bcrypt.hash(pwd, 10);
}

export async function verifyPassword(pwd: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pwd, hash);
}