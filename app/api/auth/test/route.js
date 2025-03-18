import { requireSignIn, isAdmin } from "../../../middleware/authMiddleware";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        // Apply authentication middleware
        await requireSignIn(req, res, async () => {
            await isAdmin(req, res, async () => {
                return res.status(200).json({
                    success: true,
                    message: "Admin access granted!",
                    user: req.user, // Contains decoded JWT user details
                });
            });
        });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
