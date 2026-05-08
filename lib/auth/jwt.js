import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d";

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}


export function verifyToken(token) {
  try {
    if (!token) return null

    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    console.error('JWT VERIFY ERROR:', error)
    return null
  }
}
