import asyncHandler from "express-async-handler";
import Project from "../model/project.js";
import cloudinary from "../config/cloudinary.js";


// @desc    Get all projects
// @route   GET /admin/projects
// @access  Private/Admin
const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({}).populate("courses", "title");
  res.json({ projects });
});


// @desc    Get project by ID
// @route   GET /admin/projects/:id
// @access  Private/Admin
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate(
    "courses",
    "title"
  );

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  res.json(project);
});


// @desc    Create Project
// @route   POST /admin/projects
// @access  Private/Admin
const createProject = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    category,
    specifications,
    uses,
    includes,
    status,
    selectedCourses,
  } = req.body;

  // ---------- Cloudinary Upload ----------
  let uploadedImages = [];

  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map((file) =>
      cloudinary.uploader.upload(file.path, {
        folder: "projects",
      })
    );

    const results = await Promise.all(uploadPromises);

    uploadedImages = results.map((result) => ({
      url: result.secure_url,
      public_id: result.public_id,
    }));
  }

  // ---------- JSON Parse ----------
  const parsedSpecs =
    typeof specifications === "string"
      ? JSON.parse(specifications)
      : specifications;

  const parsedUses =
    typeof uses === "string" ? JSON.parse(uses) : uses;

  const parsedIncludes =
    typeof includes === "string"
      ? JSON.parse(includes)
      : includes;

  const parsedCourses =
    typeof selectedCourses === "string"
      ? JSON.parse(selectedCourses)
      : selectedCourses;

  const project = new Project({
    name,
    description,
    category,
    status,
    images: uploadedImages,
    specifications: parsedSpecs,
    uses: parsedUses,
    includes: parsedIncludes,
    courses: parsedCourses,
  });

  const createdProject = await project.save();
  await createdProject.populate("courses", "title");

  res.status(201).json({ project: createdProject });
});


// @desc    Update Project
// @route   PUT /admin/projects/:id
// @access  Private/Admin
const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  project.name = req.body.name || project.name;
  project.description = req.body.description || project.description;
  project.category = req.body.category || project.category;
  project.status = req.body.status || project.status;

  // JSON parsing
  if (req.body.specifications)
    project.specifications =
      typeof req.body.specifications === "string"
        ? JSON.parse(req.body.specifications)
        : req.body.specifications;

  if (req.body.uses)
    project.uses =
      typeof req.body.uses === "string"
        ? JSON.parse(req.body.uses)
        : req.body.uses;

  if (req.body.includes)
    project.includes =
      typeof req.body.includes === "string"
        ? JSON.parse(req.body.includes)
        : req.body.includes;

  if (req.body.selectedCourses)
    project.courses =
      typeof req.body.selectedCourses === "string"
        ? JSON.parse(req.body.selectedCourses)
        : req.body.selectedCourses;

  // ---------- Upload New Images ----------
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map((file) =>
      cloudinary.uploader.upload(file.path, {
        folder: "projects",
      })
    );

    const results = await Promise.all(uploadPromises);

    results.forEach((result) => {
      project.images.push({
        url: result.secure_url,
        public_id: result.public_id,
      });
    });
  }

  const updatedProject = await project.save();
  res.json(updatedProject);
});


// @desc    Delete Project
// @route   DELETE /admin/projects/:id
// @access  Private/Admin
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  // Delete images from Cloudinary
  if (project.images && project.images.length > 0) {
    const deletePromises = project.images.map((image) =>
      cloudinary.uploader.destroy(image.public_id)
    );

    await Promise.all(deletePromises);
  }

  await project.deleteOne();

  res.json({ message: "Project removed successfully" });
});

export {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
