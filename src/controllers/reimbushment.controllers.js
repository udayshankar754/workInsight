import { Reimbushment } from '../models/reimbushment.models.js'; 
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { classifyFileByMimeType } from '../utils/sharedData.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

const createReimbushment = asyncHandler(async (req, res) => {
    const { amount, reason, description } = req.body;

    if (!reason) {
        throw new ApiError(400, 'Reason is required');
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new ApiError(400, 'Amount must be a valid number greater than zero');
    }


    const imageLocalPath = req.file?.path;
    let imagePath;
    if (imageLocalPath) {
      // Classify the file based on MIME type
      const resourceType = classifyFileByMimeType(req?.file?.mimetype);
  
      imagePath = await uploadOnCloudinary(
        imageLocalPath,
        resourceType
      );
    }

    const newReimbushment = await Reimbushment.create({
        amount : parsedAmount,
        image : imagePath ? imagePath?.url : '',
        userId : req?.user?._id,
        reason,
        description
    });


    return res.status(201).json(new ApiResponse(201, newReimbushment, 'Reimbushment Created Successfully'));
});

const updateReimbushment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { amount, reason, description } = req.body;
    const imageLocalPath = req.file?.path;



    if(! (amount || reason || description || imageLocalPath  )) {
        throw new ApiError(400, 'At least one field must be updated');
    }
    let  parsedAmount
    if(amount) {
        parsedAmount = Number(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            throw new ApiError(400, 'Amount must be a valid number greater than zero');
        }
    }

    let imagePath;
    if (imageLocalPath) {
      // Classify the file based on MIME type
      const resourceType = classifyFileByMimeType(req?.file?.mimetype);
  
      imagePath = await uploadOnCloudinary(
        imageLocalPath,
        resourceType
      );
    }

    const isReimbushmentExists = await Reimbushment.findById(id);

    if (!isReimbushmentExists) {
        throw new ApiError(404, 'Reimbushment Not Found');
    }

    if(!(req.user?._id?.toString() == isReimbushmentExists?.userId?.toString())) {
        throw new ApiError(403, 'You are not authorized to update this record');
    }

    const reimbushment = await Reimbushment.findByIdAndUpdate(id, {
        amount : parsedAmount ? parsedAmount : isReimbushmentExists.amount,
        image : imagePath? imagePath?.url : isReimbushmentExists.image,
        reason : reason? reason : isReimbushmentExists.reason,
        description : description? description : isReimbushmentExists.description
    }, { new: true });


    return res.status(200).json(new ApiResponse(200, reimbushment, 'Reimbushment Updated Successfully'));
});

const deleteReimbushment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const reimbushment = await Reimbushment.findById(id);

    if (!reimbushment) {
        throw new ApiError(404, 'Reimbushment Not Found');
    }

    if(!(req.user?._id?.toString() == reimbushment?.userId?.toString())) {
        throw new ApiError(403, 'You are not authorized to update this record');
    }
    

    await Reimbushment.findByIdAndDelete(id);

    return res.status(200).json(new ApiResponse(200, null, 'Reimbushment Deleted Successfully'));
});

const getAllReimbushments = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const reimbushment = await Reimbushment.find({
        userId: req?.user?._id
    })
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }); 

    const totalRecords = await Reimbushment.countDocuments({
        userId: req?.user?._id
    });

    return res.status(200).json(new ApiResponse(200, {
        reimbushment,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        currentPage: page
    }, 'Reimbushment Fetched Successfully'));
});

const getReimbushmentById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const reimbushment = await Reimbushment.findById(id);
    
    if (!reimbushment) {
        throw new ApiError(404, 'Reimbushment Not Found');
    }

    if(!(req.user?._id?.toString() == reimbushment?.userId?.toString())) {
        throw new ApiError(403, 'You are not authorized to update this record');
    }

    return res.status(200).json(new ApiResponse(200, reimbushment, 'Reimbushment Fetched Successfully'));
});



export {
    createReimbushment,
    updateReimbushment,
    deleteReimbushment,
    getAllReimbushments,
    getReimbushmentById,
};
