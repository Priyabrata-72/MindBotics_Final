import asyncHandler from "express-async-handler";
import User from "../model/user.js";
import Course from "../model/course.js";
import Enrollment from "../model/enrollment.js";
import Contact from "../model/Contact.js";
import { sendOtpEmail } from "../utils/email.js";

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
    const userCount = await User.countDocuments();
    const courseCount = await Course.countDocuments();
    const enrollmentCount = await Enrollment.countDocuments();
    const contactCount = await Contact.countDocuments();

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select("username email role createdAt");

    // Format recent activity for the frontend
    const recentActivity = recentUsers.map(u => ({
        id: u._id,
        action: "New User Registered",
        detail: `${u.username} (${u.email}) joined`,
        time: new Date(u.createdAt).toLocaleDateString() === new Date().toLocaleDateString()
            ? "Today"
            : new Date(u.createdAt).toLocaleDateString()
    }));

    res.json({
        counts: {
            users: userCount,
            courses: courseCount,
            enrollments: enrollmentCount,
            contacts: contactCount,
        },
        recentActivity,
    });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const role = req.query.role;

    const query = role ? { role } : {};

    const count = await User.countDocuments(query);

    const users = await User.find(query)
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .select("-password");

    res.json({
        users,
        page,
        pages: Math.ceil(count / pageSize),
        total: count,
    });
});

// @desc    Create new user
// @route   POST /api/admin/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res) => {
    const { username, email, role } = req.body;

    // Frontend sends 'username', we map it to 'name'
    if (!username || !email) {
        res.status(400);
        throw new Error("Name and Email are required");
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }

    // Generate random 8-character password
    const tempPassword = Math.random().toString(36).slice(-8);

    const user = await User.create({
        username,
        email,
        password: tempPassword,
        role: role || "user",
    });

    if (user) {
        // Send email with the PLAIN text tempPassword as if it were an OTP
        await sendOtpEmail(email, tempPassword, 'signup');

        res.status(201).json({
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
            message: "User created successfully",
        });
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        await user.deleteOne();
        res.json({ message: "User removed" });
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});

// @desc    Get all enrollments
// @route   GET /api/admin/enrollments
// @access  Private/Admin
const getAllEnrollments = asyncHandler(async (req, res) => {
    const pageSize = Math.max(Number(req.query.limit) || 10, 1);
    const page = Math.max(Number(req.query.page) || 1, 1);

    const count = await Enrollment.countDocuments({});

    const enrollments = await Enrollment.find({})
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .populate("user", "username email")
        .populate("course", "title category");

    res.json({
        enrollments,
        page,
        pages: Math.ceil(count / pageSize),
        total: count,
    });
});

// @desc    Get all contacts
// @route   GET /api/admin/contacts
// @access  Private/Admin
const getAllContacts = asyncHandler(async (req, res) => {
    const pageSize = Math.max(Number(req.query.limit) || 10, 1);
    const page = Math.max(Number(req.query.page) || 1, 1);

    const count = await Contact.countDocuments({});

    const contacts = await Contact.find({})
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .sort({ createdAt: -1 });

    res.json({
        contacts,
        page,
        pages: Math.ceil(count / pageSize),
        total: count,
    });
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.role = req.body.role || user.role;
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
        });
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});

// @desc    Delete contact
// @route   DELETE /api/admin/contacts/:id
// @access  Private/Admin
const deleteContact = asyncHandler(async (req, res) => {
    const contact = await Contact.findById(req.params.id);

    if (contact) {
        await contact.deleteOne();
        res.json({ message: "Contact removed" });
    } else {
        res.status(404);
        throw new Error("Contact not found");
    }
});

const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate Status
    const validStatus = ["pending", "completed", "uncompleted"];

    if (!validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    // Find and Update
    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      contact,
    });
  } catch (error) {
    console.error("Update Contact Status Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};



export {
    getDashboardStats,
    getAllUsers,
    createUser,
    deleteUser,
    updateUserRole,
    getAllEnrollments,
    getAllContacts,
    updateContactStatus,
    deleteContact
};
