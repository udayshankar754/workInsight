import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Client } from '../models/client.models.js';
import { isValidObjectId } from "mongoose";

const createClient = asyncHandler( async (req, res) => {
  const { name, email } = req.body;
  if (!name ||!email) {
    throw new ApiError(400, 'Please provide name and email');
  }
  const existingClient = await Client.findOne({ email });
  if (existingClient) {
    throw new ApiError(400, 'Client with the same email already exists');
  }
  const client = await Client.create({ name, email });
  return res.status(201).json(new ApiResponse(200 , client , 'Client created successfully'));
});

const getAllClients = asyncHandler(async (req, res) => {
  const clients = await Client.find({});
  return res.status(200).json(new ApiResponse(200, clients, 'All Clients fetched successfully'));
});

const getClientById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, 'Please provide an ID');
  }
  const isValidClientObjectId = await isValidObjectId(id);
  if (!isValidClientObjectId) {
    throw new ApiError(400, 'Invalid Client Object Id');
  }
  
  const client = await Client.findById(id);

  if (!client) {
    throw new ApiError(404, 'Client not found');
  }
  return res.status(200).json(new ApiResponse(200, client, 'Client fetched successfully'));
});

const updateClient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, 'Please provide an ID');
  }
  const isValidClientObjectId = await isValidObjectId(id);
  if (!isValidClientObjectId) {
    throw new ApiError(400, 'Invalid Client Object Id');
  }
  
  const { name, email } = req.body;
  if (!name && !email) {
    throw new ApiError(400, 'Please provide name or email');
  }
  const client = await Client.findByIdAndUpdate(id, { name, email }, { new: true });
  if (!client) {
    throw new ApiError(404, 'Client not found');
  }
  return res.status(200).json(new ApiResponse(200, client, 'Client updated successfully'));
});

const deleteClient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, 'Please provide an ID');
  }
  const isValidClientObjectId = await isValidObjectId(id);
  if (!isValidClientObjectId) {
    throw new ApiError(400, 'Invalid Client Object Id');
  }
  
  const client = await Client.findByIdAndDelete(id);
  
  if (!client) {
    throw new ApiError(404, 'Client not found');
  }
  return res.status(200).json(new ApiResponse(200, null, 'Client deleted successfully'));
});



export {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
};
