import jwt from "jsonwebtoken";

export const verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
};
