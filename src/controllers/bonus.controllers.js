import { Bonus } from '../models/bonus.models.js';  
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { classifyFileByMimeType } from '../utils/sharedData.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

// Create Bonus
const createBonus = asyncHandler(async (req, res) => {
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

    const newBonus = await Bonus.create({
        amount : parsedAmount,
        image : imagePath ? imagePath?.url : '',
        userId : req?.user?._id,
        reason,
        description
    });


    return res.status(201).json(new ApiResponse(201, newBonus, 'Bonus Created Successfully'));
});

// Update Bonus
const updateBonus = asyncHandler(async (req, res) => {
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

    const isBonusExists = await Bonus.findById(id);

    if (!isBonusExists) {
        throw new ApiError(404, 'Bonus Not Found');
    }

    if(!(req.user?._id?.toString() == isBonusExists?.userId?.toString())) {
        throw new ApiError(403, 'You are not authorized to update this record');
    }

    const bonus = await Bonus.findByIdAndUpdate(id, {
        amount : parsedAmount ? parsedAmount : isBonusExists.amount,
        image : imagePath? imagePath?.url : isBonusExists.image,
        reason : reason? reason : isBonusExists.reason,
        description : description? description : isBonusExists.description
    }, { new: true });


    return res.status(200).json(new ApiResponse(200, bonus, 'Bonus Updated Successfully'));
});

// Delete Bonus
const deleteBonus = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const bonus = await Bonus.findById(id);

    if (!bonus) {
        throw new ApiError(404, 'Bonus Not Found');
    }

    if(!(req.user?._id?.toString() == bonus?.userId?.toString())) {
        throw new ApiError(403, 'You are not authorized to update this record');
    }
    

    await Bonus.findByIdAndDelete(id);

    return res.status(200).json(new ApiResponse(200, null, 'Bonus Deleted Successfully'));
});

// Get All Bonuses (Paginated)
const getAllBonuses = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const bonuses = await Bonus.find({
        userId: req?.user?._id
    })
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }); 

    const totalRecords = await Bonus.countDocuments({
        userId: req?.user?._id
    });

    return res.status(200).json(new ApiResponse(200, {
        bonuses,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        currentPage: page
    }, 'Bonuses Fetched Successfully'));
});

// Get Bonus By ID
const getBonusById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const bonus = await Bonus.findById(id);
    
    if (!bonus) {
        throw new ApiError(404, 'Bonus Not Found');
    }

    if(!(req.user?._id?.toString() == bonus?.userId?.toString())) {
        throw new ApiError(403, 'You are not authorized to update this record');
    }

    return res.status(200).json(new ApiResponse(200, bonus, 'Bonus Fetched Successfully'));
});



export {
    createBonus,
    getAllBonuses,
    getBonusById,
    updateBonus,
    deleteBonus
};
