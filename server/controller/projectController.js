import asyncHandler from "express-async-handler";
import Project from "../model/project.js";
import cloudinary from "../config/cloudinary.js";



const safeParse = (data, defaultValue = []) => {
  try {
    return typeof data === "string" ? JSON.parse(data) : data;
  } catch {
    return defaultValue;
  }
};

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
    price,
    keyFeature,
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

  const parsedSpecs = safeParse(specifications);
  const parsedUses = safeParse(uses);
  const parsedIncludes = safeParse(includes);
  const parsedCourses = safeParse(selectedCourses);
  const parsedFeatures = safeParse(keyFeature);
  // ---------- JSON Parse ----------
  // const parsedSpecs =
  //   typeof specifications === "string"
  //     ? JSON.parse(specifications)
  //     : specifications;

  // const parsedUses =
  //   typeof uses === "string" ? JSON.parse(uses) : uses;

  // const parsedIncludes =
  //   typeof includes === "string"
  //     ? JSON.parse(includes)
  //     : includes;

  // const parsedCourses =
  //   typeof selectedCourses === "string"
  //     ? JSON.parse(selectedCourses)
  //     : selectedCourses;

  // const parsedFeatures =
  //   typeof keyFeature === "string"
  //     ? JSON.parse(keyFeature)
  //     : keyFeature;

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
    keyFeature: parsedFeatures,
    price,
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
  if (req.body.removeImages) {
    const imagesToRemove =
      typeof req.body.removeImages === "string"
        ? JSON.parse(req.body.removeImages)
        : req.body.removeImages;

    for (const imgId of imagesToRemove) {
      await cloudinary.uploader.destroy(imgId);
    }

    project.images = project.images.filter(
      (img) => !imagesToRemove.includes(img.public_id)
    );
  }

  project.name = req.body.name || project.name;
  project.description = req.body.description || project.description;
  project.category = req.body.category || project.category;
  project.status = req.body.status || project.status;

  // JSON parsing
  if (req.body.specifications)
    project.specifications = safeParse(req.body.specifications);

  if (req.body.uses)
    project.uses = safeParse(req.body.uses);

  if (req.body.includes)
    project.includes = safeParse(req.body.includes);

  if (req.body.selectedCourses)
    project.courses = safeParse(req.body.selectedCourses);

  if (req.body.keyFeature)
    project.keyFeature = safeParse(req.body.keyFeature);

  project.price = req.body.price ?? project.price;

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
  await updatedProject.populate("courses", "title");

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
