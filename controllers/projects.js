const Project = require("../models/Project");
const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");

const getAllProjects = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId });
  if (user.accountType === "admin") {
    const projects = await Project.find({}).sort("createdBy");
    res.status(StatusCodes.OK).json({ projects, count: projects.length });
  } else if (user.accountType === "designer") {
    const projects = await Project.find({
      assignedToDesigner: req.user.userId,
    }).sort("status");
    res.status(StatusCodes.OK).json({ projects, count: projects.length });
  } else {
    const projects = await Project.find({ createdBy: req.user.userId }).sort(
      "status"
    );
    res.status(StatusCodes.OK).json({ projects, count: projects.length });
  }
};

const getProject = async (req, res) => {
  const {
    user: { userId },
    params: { id: projectId },
  } = req;
  const user = await User.findOne({ _id: req.user.userId });
  if (user.accountType === "admin") {
    const project = await Project.findOne({
      _id: projectId,
    });
    if (!project) {
      throw new NotFoundError(`No project with id: ${projectId}`);
    }
    res.status(StatusCodes.OK).json({ project });
  } else if (user.accountType === "designer") {
    const project = await Project.findOne({
      _id: projectId,
      assignedToDesigner: userId,
    });
    if (!project) {
      throw new NotFoundError(`No project with id: ${projectId}`);
    }
    res.status(StatusCodes.OK).json({ project });
  } else {
    const project = await Project.findOne({
      _id: projectId,
      createdBy: userId,
    });
    if (!project) {
      throw new NotFoundError(`No project with id: ${projectId}`);
    }
    res.status(StatusCodes.OK).json({ project });
  }
};

const createProject = async (req, res) => {
  req.body.createdBy = req.user.userId;
  const project = await Project.create(req.body);
  res.status(StatusCodes.CREATED).json({ project });
};

const updateProject = async (req, res) => {
  const {
    body: { title, description, status },
    params: { id: projectId },
  } = req;

  if (title === "" || description === "") {
    throw new BadRequestError("Please provide a title and description");
  }

  const project = await Project.findByIdAndUpdate(
    { _id: projectId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!project) {
    throw new NotFoundError(`No project with id ${projectId}`);
  }

  res.status(StatusCodes.OK).json({ project });
};

const deleteProject = async (req, res) => {
  const {
    params: { id: projectId },
  } = req;

  const user = await User.findOne({ _id: req.user.userId });
  if (user.accountType === "admin") {
    const project = await Project.findByIdAndDelete({
      _id: projectId,
    });

    if (!project) {
      throw new NotFoundError(`No project with id ${projectId}`);
    }
    res.status(StatusCodes.OK).json({ project });
  }
};

const assignProject = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId });

  if (user.accountType === "admin") {
    const {
      body: { assignedToDesigner },
      params: { id: projectId },
    } = req;

    if (assignedToDesigner === "") {
      throw new BadRequestError("Please select a designer");
    }

    const project = await Project.findByIdAndUpdate(
      { _id: projectId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!project) {
      throw new NotFoundError(`No project with id ${projectId}`);
    }

    res.status(StatusCodes.OK).json({ project });
  } else {
    throw new BadRequestError("User is not authorized");
  }
};

module.exports = {
  getAllProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  assignProject,
};
