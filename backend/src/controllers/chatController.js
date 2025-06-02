const { generateStreamToken } = require("../lib/stream");

module.exports.getStreamToken = async (req, res) => {
    try {
        const userId = req.user.id;
        const token = generateStreamToken(userId);
        if (!token) {
            return res.status(500).json({ message: "Error generating stream token" });
        }
        res.status(200).json({ message: "Stream token fetched successfully", token });
    } catch (error) {
        console.error("Error fetching stream token:", error.message);
        res.status(500).json({ message: "Error fetching stream token" });
    }
}