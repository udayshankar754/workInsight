import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { isValidObjectId } from 'mongoose';
import { ProjectSection } from '../models/projectSection.models.js';
import { Client } from '../models/client.models.js';
import { User } from '../models/user.models.js';
import { project_status_enum } from '../utils/TypeEnum.js';

const createProject = asyncHandler(async (req, res) => {
  const {
    clientId,
    projectInfo,
    projectDocs,
    isApproved,
    projectStatus,
    projectDeadline,
    projectPriority,
  } = req.body;
  let parsedDueDate;
  if (!(clientId || projectInfo)) {
    throw new ApiError(400, 'Please provide client id and project info');
  }

  if (clientId) {
    if (!isValidObjectId(clientId)) {
      throw new ApiError(400, 'Invalid client id');
    }
    const client = await Client.findById(clientId);
    if (!client) {
      throw new ApiError(400, 'Invalid client id');
    }
  }

  if (isApproved) {
    if (
      typeof isApproved !== 'boolean' ||
      isApproved === 'true' ||
      isApproved === 'false'
    ) {
      throw new ApiError(400, 'isApproved must be boolean');
    }
  }

  if (projectStatus) {
    if (!project_status_enum.includes(projectStatus)) {
      throw new ApiError(400, 'Invalid project status');
    }
  }

  if (projectPriority) {
    if (typeof projectPriority !== 'number' || isNaN(projectPriority)) {
      throw new ApiError(400, 'projectPriority must be a number');
    }

    if (projectPriority < 1 || projectPriority > 10) {
      throw new ApiError(400, 'projectPriority must be between 1 and 10');
    }
  }

  if (projectDeadline) {
    parsedDueDate = new Date(projectDeadline);

    if (isNaN(parsedDueDate)) {
      throw new ApiError(400, 'Invalid due date format');
    }
  }

  const isProjectExistted = await ProjectSection.findOne({
    $and: [{ clientId }, { projectInfo }],
  });

  if (isProjectExistted) {
    throw new ApiError(400, 'Project with the same client id or project info already exists');
  }


  const project = await ProjectSection.create({
    clientId,
    projectInfo,
    projectDocs,
    isApproved,
    approvedBy: isApproved ? req.user?._id : null,
    projectStatus,
    projectDeadline: projectDeadline ? parsedDueDate : null,
    projectPriority: Number(projectPriority),
  });

  return res
    .status(201)
    .json(new ApiResponse(200, project, 'Project created successfully'));
});

const getProject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid project id');
  }

  const project = await ProjectSection.findById(id);

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  return res.json(
    new ApiResponse(200, project, 'Project retrieved successfully')
  );
});

const getAllProjects = asyncHandler(async (req, res) => {
  const projects = await ProjectSection.find({});

  return res.json(
    new ApiResponse(200, projects, 'Projects retrieved successfully')
  );
});

const getCompletedProjects = asyncHandler(async (req, res) => {
  const projects = await ProjectSection.find({
    $or: [{ projectStatus: 'Completed' }, { isCompleted: true }],
  });

  return res.json(
    new ApiResponse(200, projects, 'Completed Projects retrieved successfully')
  );
});

const getInCompletedProjects = asyncHandler(async (req, res) => {
  const projects = await ProjectSection.find({
    projectStatus: { $ne: 'Completed' },
    isCompleted: false,
  });

  return res.json(
    new ApiResponse(200, projects, 'Incomplete projects retrieved successfully')
  );
});

const getProjectsByDueDate = asyncHandler(async (req, res) => {
  const { dueDate } = req.query;

  if (!dueDate) {
    throw new ApiError(400, 'Please provide due date');
  }

  const parsedDueDate = new Date(dueDate);

  if (isNaN(parsedDueDate)) {
    throw new ApiError(400, 'Invalid due date format');
  }

  const projects = await ProjectSection.find({
    projectDeadline: { $lte: parsedDueDate },
  });

  return res.json(
    new ApiResponse(200, projects, 'Projects fetched successfully')
  );
});

const getProjectsByPriority = asyncHandler(async (req, res) => {
  const { priority } = req.query;

  if (!priority) {
    throw new ApiError(400, 'Please provide priority');
  }
  const priorityNumber = Number(priority);  // Convert to number

  if (!priorityNumber) {
    throw new ApiError(400, 'priority must be a number');
  }

  if (priorityNumber < 1 || priorityNumber > 10) {
    throw new ApiError(400, 'priority must be between 1 and 10');
  }

  const projects = await ProjectSection.find({
    projectPriority: priorityNumber,
  });

  return res.json(
    new ApiResponse(200, projects, 'Projects fetched successfully')
  );
});

const getProjectsByStatus = asyncHandler(async (req, res) => {
  const { status } = req.query;

  if (!status) {
    throw new ApiError(400, 'Please provide status');
  }

  if (!project_status_enum.includes(status)) {
    throw new ApiError(400, 'Invalid status');
  }

  const projects = await ProjectSection.find({
    projectStatus: status,
  });

  return res.json(
    new ApiResponse(200, projects, 'Projects fetched successfully')
  );
});

const getAllProjectByPriority = asyncHandler(async (req, res) => {
  const projects = await ProjectSection.find().sort({ projectPriority: 'asc' });

  return res.json(
    new ApiResponse(200, projects, 'Projects fetched successfully')
  );
});

const updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    projectInfo,
    projectDocs,
    isApproved,
    approvedBy,
    projectStatus,
    projectDeadline,
    projectPriority,
  } = req.body;
  let parsedDueDate;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid project id');
  }

  if (isApproved) {
    if (
      typeof isApproved !== 'boolean' ||
      isApproved === 'true' ||
      isApproved === 'false'
    ) {
      throw new ApiError(400, 'isApproved must be boolean');
    }
  }

  if (projectStatus) {
    if (!project_status_enum.includes(projectStatus)) {
      throw new ApiError(400, 'Invalid project status');
    }
  }

  if (projectPriority) {
    if (typeof projectPriority !== 'number' || isNaN(projectPriority)) {
      throw new ApiError(400, 'projectPriority must be a number');
    }

    if (projectPriority < 1 || projectPriority > 10) {
      throw new ApiError(400, 'projectPriority must be between 1 and 10');
    }
  }

  if (projectDeadline) {
    parsedDueDate = new Date(projectDeadline);

    if (isNaN(parsedDueDate)) {
      throw new ApiError(400, 'Invalid due date format');
    }
  }

  if (approvedBy) {
    if (!isValidObjectId(approvedBy)) {
      throw new ApiError(400, 'Invalid approvedBy id');
    }
    const approvedByUser = await User.findById(approvedBy);
    if (!approvedByUser) {
      throw new ApiError(400, 'Invalid approvedBy id');
    }
  }

  const updatedProject = await ProjectSection.findByIdAndUpdate(
    id,
    {
      projectInfo,
      projectDocs,
      isApproved,
      approvedBy,
      projectStatus,
      projectDeadline: parsedDueDate ? parsedDueDate : null,
      projectPriority: Number(projectPriority),
    },
    { new: true }
  );

  if (!updatedProject) {
    throw new ApiError(404, 'Project not found');
  }

  return res.json(
    new ApiResponse(200, updatedProject, 'Project updated successfully')
  );
});

const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid project id');
  }

  const deletedProject = await ProjectSection.findByIdAndDelete(id);

  if (!deletedProject) {
    throw new ApiError(404, 'Project not found');
  }

  return res.json(
    new ApiResponse(200, deletedProject, 'Project deleted successfully')
  );
});

const getProjectsByClient = asyncHandler(async (req, res) => {
  const { clientId } = req.params;

  if (!clientId) {
    throw new ApiError(400, 'Please provide client id');
  }

  if (!isValidObjectId(clientId)) {
    throw new ApiError(400, 'Invalid client id');
  }

  const projects = await ProjectSection.find({ clientId });

  return res.json(
    new ApiResponse(200, projects, 'Projects retrieved successfully')
  );
});

const getProjectsByApprovedBy = asyncHandler(async (req, res) => {
  const { approvedBy } = req.params;

  if (!approvedBy) {
    throw new ApiError(400, 'Please provide approvedBy id');
  }

  if (!isValidObjectId(approvedBy)) {
    throw new ApiError(400, 'Invalid approvedBy id');
  }

  const projects = await ProjectSection.find({ approvedBy });

  return res.json(
    new ApiResponse(200, projects, 'Projects retrieved successfully')
  );
});

const chagesInProjectStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { projectStatus } = req.query;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid project id');
  }
  if (!projectStatus) {
    throw new ApiError(400, 'Please provide project status');
  }
  if (!project_status_enum.includes(projectStatus)) {
    throw new ApiError(400, 'Invalid project status');
  }

 
  
  const updatedProject = await ProjectSection.findByIdAndUpdate(
    id,
    { projectStatus , isCompleted :  projectStatus === 'Completed' ? true : false },
    { new: true }
  );
  if (!updatedProject) {
    throw new ApiError(404, 'Project not found');
  }
  return res.json(
    new ApiResponse(200, updatedProject, 'Project status updated successfully')
  );
});

const chagesInProjectPriority = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { priority } = req.query;
  if (!isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid project id');
  }
  if (!priority) {
    throw new ApiError(400, 'Please provide project priority');
  }
  
  const priorityNumber = Number(priority);
  if (isNaN(priorityNumber)) {
    throw new ApiError(400, 'priority must be a number');
  }

  
  if (priorityNumber < 1 || priorityNumber > 10) {
    throw new ApiError(400, 'projectPriority must be between 1 and 10');
  }
  const updatedProject = await ProjectSection.findByIdAndUpdate(
    id,
    { projectPriority : priorityNumber },
    { new: true }
  );
  if (!updatedProject) {
    throw new ApiError(404, 'Project not found');
  }
  return res.json(
    new ApiResponse(200, updatedProject, 'Project priority updated successfully')
  );
});

const chagesInProjectDeadline = asyncHandler(async (req , res) => {
  const { id } = req.params;
  const { deadline } = req.query;
  if (!isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid project id');
  }
  if (!deadline) {
    throw new ApiError(400, 'Please provide project deadline');
  }
  let parsedDueDate;
  parsedDueDate = new Date(deadline);
  if (isNaN(parsedDueDate)) {
    throw new ApiError(400, 'Invalid due date format');
  }
  const updatedProject = await ProjectSection.findByIdAndUpdate(
    id,
    { projectDeadline : parsedDueDate },
    { new: true }
  );
  if (!updatedProject) {
    throw new ApiError(404, 'Project not found');
  }
  return res.json(
    new ApiResponse(200, updatedProject, 'Project deadline updated successfully')
  );
})

export {
  createProject,
  getProject,
  getAllProjects,
  getCompletedProjects,
  getInCompletedProjects,
  getProjectsByDueDate,
  getProjectsByPriority,
  getProjectsByStatus,
  getAllProjectByPriority,
  updateProject,
  deleteProject,
  getProjectsByClient,
  getProjectsByApprovedBy,
  chagesInProjectStatus,
  chagesInProjectPriority,
  chagesInProjectDeadline
};
