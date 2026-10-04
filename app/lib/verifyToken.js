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

// Signed-in user's id from the "Authorization: Bearer <token>" header, or null if missing/invalid
export const getUserIdFromRequest = async (req) => {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) return null;

  const decoded = await verifyToken(token);
  return decoded?._id || null;
};

export const unauthorizedResponse = () =>
  new Response(JSON.stringify({ success: false, message: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
