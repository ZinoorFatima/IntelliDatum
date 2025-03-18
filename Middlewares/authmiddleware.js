import JWT from "jsonwebtoken";
import userModel from "../../models/usermodel";

// Middleware: Require Authentication
export const requireSignIn = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer token
        if (!token) {
            return res.status(401).json({ error: "Unauthorized, no token provided" });
        }

        const decoded = JWT.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user data to request
        return next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};

// Middleware: Check Admin Role
export const isAdmin = async (req, res, next) => {
    try {
        const user = await userModel.findById(req.user._id);
        if (!user || user.role !== 1) {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }

        return next();
    } catch (error) {
        return res.status(500).json({ error: "Error checking admin status" });
    }
};
