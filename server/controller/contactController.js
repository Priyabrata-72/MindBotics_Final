import Contact from "../model/Contact.js";
import asyncHandler from "express-async-handler";

export const createContact = asyncHandler(async (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    const trimmedName = name?.trim();
    const trimmedEmail = email?.trim().toLowerCase();
    const trimmedPhone = phone?.trim();
    const trimmedSubject = subject?.trim();
    const trimmedMessage = message?.trim();

    if (!trimmedName || !trimmedEmail || !trimmedSubject || !trimmedMessage) {
        return res.status(400).json({
            success: false,
            message: "All required fields are mandatory",
        });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(trimmedEmail)) {
        return res.status(400).json({
            success: false,
            message: "Please provide a valid email address",
        });
    }

    const contact = await Contact.create({
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone || undefined,
        subject: trimmedSubject,
        message: trimmedMessage,
        status: "pending",
    });

    res.status(201).json({
        success: true,
        message: "Message sent successfully",
        data: contact,
    });
});
