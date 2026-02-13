import asyncHandler from "express-async-handler";
import Course from "../model/course.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinaryHelper.js";

// @desc    Fetch all active courses
// @route   GET /api/courses
// @access  Public
const getCourses = asyncHandler(async (req, res) => {
    const courses = await Course.find({ status: "active" }).populate("instructor", "username email");
    res.json(courses);
});

// @desc    Fetch all courses (Admin)
// @route   GET /api/admin/courses
// @access  Private/Admin
const getAdminCourses = asyncHandler(async (req, res) => {
    const pageSize = Math.max(Number(req.query.limit) || 12, 1);
    const page = Math.max(Number(req.query.page) || 1, 1);

    const count = await Course.countDocuments({});

    const courses = await Course.find({})
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .populate("instructor", "username email");

    res.json({
        courses,
        page,
        pages: Math.ceil(count / pageSize),
        total: count,
    });
});

// @desc    Fetch single course
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id).populate("instructor", "username email");

    if (course) {
        res.json(course);
        console.log(course)
    } else {
        res.status(404);
        throw new Error("Course not found");
    }
});

// @desc    Create a course
// @route   POST /api/courses
// @access  Private/Admin
const createCourse = asyncHandler(async (req, res) => {
    console.log("Create Course Request Received");
    console.log("Body:", JSON.stringify(req.body, null, 2));
    console.log("User:", req.user?._id);
    console.log("File:", req.file ? req.file.filename : "No file");

    try {
        const { title, shortDescription, description, category, price, level, duration, rating, instructorName } = req.body;

        let { syllabus, requirements, learningOutcomes } = req.body;

        // Handle JSON strings from FormData
        try {
            if (typeof syllabus === 'string') syllabus = JSON.parse(syllabus);
            if (typeof requirements === 'string') requirements = JSON.parse(requirements);
            if (typeof learningOutcomes === 'string') learningOutcomes = JSON.parse(learningOutcomes);
        } catch (e) {
            console.error("Error parsing course JSON fields:", e);
        }

        const baseSlug = title ? title.toLowerCase().split(" ").join("-").replace(/[^a-z0-9-]/g, "") : "course";
        const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;

        let imageData = { url: "", public_id: "" };
        const file = req.file || (req.files && req.files.length > 0 ? req.files[0] : null);

        if (file) {
            try {
                imageData = await uploadToCloudinary(file.path, 'courses');
            } catch (uploadError) {
                console.error("Cloudinary upload failed:", uploadError);
            }
        }

        if (!title) {
            res.status(400);
            throw new Error("Course title is required");
        }

        const course = new Course({
            title,
            slug,
            shortDescription: shortDescription || title || "Course",
            fullDescription: description || shortDescription || title || "Course description",
            category: category || "General",
            price: Number(price) || 0,
            level: level || "Beginner",
            duration: duration || "",
            instructorName: instructorName || "",
            averageRating: Number(rating) || 0,
            syllabus: Array.isArray(syllabus) ? syllabus : [],
            requirements: Array.isArray(requirements) ? requirements : [],
            learningOutcomes: Array.isArray(learningOutcomes)
                ? learningOutcomes
                : [],
            image: imageData,
            status: "active",
            instructor: req.user ? req.user._id : null,
        });

        const createdCourse = await course.save();
        res.status(201).json(createdCourse);
    } catch (error) {
        console.error("Course creation error:", error);
        res.status(500).json({
            message: error.message || "Failed to create course",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});


// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Admin
const updateCourse = asyncHandler(async (req, res) => {
    try {
        const { title, shortDescription, description, category, price, level, status, duration, rating, instructorName } = req.body;

        let { syllabus, requirements, learningOutcomes } = req.body;

        const course = await Course.findById(req.params.id);

        if (course) {
            // Handle JSON strings
            try {
                if (typeof syllabus === 'string') syllabus = JSON.parse(syllabus);
                if (typeof requirements === 'string') requirements = JSON.parse(requirements);
                if (typeof learningOutcomes === 'string') learningOutcomes = JSON.parse(learningOutcomes);
            } catch (e) {
                console.error("Error parsing course JSON fields in update:", e);
            }

            course.title = title || course.title;
            course.shortDescription = shortDescription || course.shortDescription;
            course.fullDescription = description || course.fullDescription; // Map 'description' to 'fullDescription'
            course.category = category || course.category;
            course.price = price !== undefined ? Number(price) : course.price;
            course.level = level || course.level;
            course.status = status || course.status;
            course.duration = duration || course.duration;
            course.instructorName = instructorName || course.instructorName;
            course.averageRating = rating !== undefined ? Number(rating) : course.averageRating;

            if (syllabus) course.syllabus = syllabus;
            if (requirements) course.requirements = requirements;
            if (learningOutcomes) course.learningOutcomes = learningOutcomes;

            const file = req.file || (req.files && req.files.length > 0 ? req.files[0] : null);

            if (file) {
                try {
                    // Delete old image from Cloudinary if it exists
                    if (course.image && course.image.public_id) {
                        await deleteFromCloudinary(course.image.public_id);
                    }
                    // Upload new image
                    const imageData = await uploadToCloudinary(file.path, 'courses');
                    course.image = imageData;
                } catch (imgError) {
                    console.error("Image update failed:", imgError);
                }
            }

            if (title) {
                course.slug = title.toLowerCase().split(" ").join("-");
            }

            const updatedCourse = await course.save();
            res.json(updatedCourse);
        } else {
            res.status(404);
            throw new Error("Course not found");
        }
    } catch (error) {
        console.error("Course update error:", error);
        res.status(500).json({
            message: error.message || "Failed to update course",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
const deleteCourse = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);

    if (course) {
        // Delete image from Cloudinary
        if (course.image && course.image.public_id) {
            await deleteFromCloudinary(course.image.public_id);
        }

        await course.deleteOne();
        res.json({ message: "Course removed" });
    } else {
        res.status(404);
        throw new Error("Course not found");
    }
});

export { getCourses, getAdminCourses, getCourseById, createCourse, updateCourse, deleteCourse };

