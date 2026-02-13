import Contact from "../model/Contact.js";

export const createContact = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "All required fields are mandatory",
            });
        }

        const contact = await Contact.create({
            name,
            email,
            phone,
            subject,
            message,
        });

        res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: contact,
        });
    } catch (error) {
        console.error("Contact Controller Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
