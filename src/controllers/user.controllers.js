import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.models.js';
import {
  removeFromCloudinary,
  uploadOnCloudinary,
} from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { role_type_enum, gender_enum, marital_status_enum, blood_groups_enum } from '../utils/TypeEnum.js';

const classifyFileByMimeType = (mimetype) => {
  if (mimetype.startsWith('image/')) {
    return 'image'; // All image MIME types (e.g., image/jpeg, image/png, etc.)
  } else if (mimetype.startsWith('video/')) {
    return 'video'; // All video MIME types (e.g., video/mp4, video/webm, etc.)
  } else {
    return 'file'; // Anything else, treat as raw file (e.g., pdf, docx, zip, etc.)
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const {
    managerId,
    bonusId,
    employeeDocumentId,
    reimbushmentId,
    name,
    email,
    annualSalary,
    advanceSalary,
    roleType,
    dateOfHiring,
    title,
    location,
    bankName,
    ifscCode,
    accountNo,
    panNo,
    beneficiaryName,
    pfStatus,
    pfUanNo,
    professionalTax,
    lwfStatus,
    esicStatus,
    esicIpNumber,
    phoneNumber,
    gender,
    dateOfBirth,
    personalPhoneNumber,
    personalEmailAddress,
    fathersName,
    fathersDOB,
    mothersName,
    mothersDOB,
    spousesName,
    spousesDOB,
    child1Name,
    child1DOB,
    child2Name,
    child2DOB,
    permanentAddress,
    temporaryAddress,
    highestEducationalQualification,
    aadhaarNumber,
    maritalStatus,
    workExperience,
    previousEmployer,
    previousDesignation,
    marriageAnniversary,
    emergencyContactName,
    emergencyContactNumber,
    bloodGroup,
    nationality,
    password,
  } = req.body;

  console.log(req.body);
  if ([name, email, password].some((fields) => fields?.trim() === '')) {
    throw new ApiError(400, 'Please fill all the Required fields');
  }

  if(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ApiError(400, 'Invalid email format');
    }
  }

  if(personalEmailAddress) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(personalEmailAddress)) {
      throw new ApiError(400, 'Invalid personal email format');
    }
  }

  if(roleType) {
    if (!role_type_enum.includes(roleType)) {
      throw new ApiError(400, 'Invalid role type');
    }
  }

  if(gender) {
    if (!gender_enum.includes(gender)) {
      throw new ApiError(400, 'Invalid gender');
    }
  }

  if(maritalStatus) {
    if (!marital_status_enum.includes(maritalStatus)) {
      throw new ApiError(400, 'Invalid marital status');
    }
  }

  if(bloodGroup) {
    if (!blood_groups_enum.includes(bloodGroup)) {
      throw new ApiError(400, 'Invalid blood group');
    }
  }

  if(managerId) {
    const isValidObjectId  = await isValidObjectId(managerId);
    if (!isValidObjectId) {
      throw new ApiError(400, 'Invalid managerId');
    }

    const isMangerExists = await User.findById(managerId);

    if(!isMangerExists) {
      throw new ApiError(400, 'Invalid managerId');
    }
  }

  if(bonusId) {
    const isValidObjectId  = await isValidObjectId(bonusId);
    if (!isValidObjectId) {
      throw new ApiError(400, 'Invalid Bonus Id');
    }

    const isBonusExists = await Bonus.findById(bonusId);

    if(!isBonusExists) {
      throw new ApiError(400, 'Invalid Bonus Id');
    }
  }

  if(employeeDocumentId) {
    const isValidObjectId  = await isValidObjectId(employeeDocumentId);
    if (!isValidObjectId) {
      throw new ApiError(400, 'Invalid Employee Document Id');
    }

    const isEmployeeDocumentExists = await EmployeeDocument.findById(employeeDocumentId);

    if(!isEmployeeDocumentExists) {
      throw new ApiError(400, 'Invalid Employee Document Id');
    }
  }

  if(reimbushmentId) {
    const isValidObjectId  = await isValidObjectId(reimbushmentId);
    if (!isValidObjectId) {
      throw new ApiError(400, 'Invalid Reimbushment Id');
    }

    const isReimbushmentExists = await Reimbursement.findById(reimbushmentId);

    if(!isReimbushmentExists) {
      throw new ApiError(400, 'Invalid Reimbushment Id');
        }
  }

    
  const existedUser = await User.findOne({ email });

  if (existedUser) {
    throw new ApiError(401, 'User already exists');
  }

  const profileImageLocalPath = req.file?.path;
  let profileImagePath;
  if (profileImageLocalPath) {
    // Classify the file based on MIME type
    const resourceType = classifyFileByMimeType(req?.file?.mimetype);

    profileImagePath = await uploadOnCloudinary(
      profileImageLocalPath,
      resourceType
    );
  }

  const user = await User.create({
    managerId,
    bonusId,
    employeeDocumentId,
    reimbushmentId,
    name,
    email,
    annualSalary,
    advanceSalary,
    roleType,
    dateOfHiring,
    title,
    location,
    bankName,
    ifscCode,
    accountNo,
    panNo,
    beneficiaryName,
    pfStatus,
    pfUanNo,
    professionalTax,
    lwfStatus,
    esicStatus,
    esicIpNumber,
    phoneNumber,
    gender,
    dateOfBirth,
    personalPhoneNumber,
    personalEmailAddress,
    fathersName,
    fathersDOB,
    mothersName,
    mothersDOB,
    spousesName,
    spousesDOB,
    child1Name,
    child1DOB,
    child2Name,
    child2DOB,
    permanentAddress,
    temporaryAddress,
    highestEducationalQualification,
    aadhaarNumber,
    maritalStatus,
    workExperience,
    previousEmployer,
    previousDesignation,
    marriageAnniversary,
    emergencyContactName,
    emergencyContactNumber,
    bloodGroup,
    nationality,
    password,
    profileImage: profileImagePath ? profileImagePath?.url : '',
  });

  if (!user) {
    throw new ApiError(500, 'Internal Server Error Try Again');
  }

  return res
    .status(201)
    .json(new ApiResponse(200, user, 'User Registered Successfully'));
});

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      'something  Went Wrong While Generating Access Token and Refresh Token'
    );
  }
};

const loginUser = asyncHandler(async (req, res) => {
  /*  
    req body -- data
    username or email
    find user
    check if password is correct
    access token and refresh token
    send cookies
     */

  const { email, username, password } = req.body;

  if (!(username && email)) {
    throw new ApiError(400, 'Please enter a username and email');
  }

  const user = await User.findOne({
    $and: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, 'User does not exist');
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid User Credentials');
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    ' -password -refreshToken'
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        'User Logged In Successfully'
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, {}, 'User Logged Out Successfully'));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req?.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Unauthorized Request');
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id).select(
      ' -password -refreshToken'
    );

    if (!user) {
      throw new ApiError(401, 'Invalid Refresh Token');
    }

    if (incomingRefreshToken != user?.refreshToken) {
      throw new ApiError(401, 'Refresh Token is Expired or used');
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user?._id
    );
    return res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: user,
            accessToken,
            refreshToken,
          },
          'User Logged In Successfully'
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || 'Invalid Refresh Token');
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(401, 'Invalid Old Password');
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Password Changed Successfully'));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, 'User Fetched Successfully'));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { email, fullName } = req.body;
  if (!(email || fullName)) {
    throw new ApiError(400, 'Please fill all the fields');
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        email,
        fullName,
      },
    },
    {
      new: true,
    }
  ).select('-password -refreshToken');

  res.user = user;

  return res
    .status(200)
    .json(new ApiResponse(200, user, 'Account Details Updated Successfully'));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, 'Avatar file is Required');
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath, 'image');
  if (!avatar?.url) {
    throw new ApiError(500, 'Something went wrong uploading avatar Image');
  }
  const removeAvatar = await removeFromCloudinary(req.user?.avatar, 'image');

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar?.url,
      },
    },
    {
      new: true,
    }
  ).select(' -password -refreshToken');
  req.user = user;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { RemoveAvatar: removeAvatar, user },
        'Avatar Updated Successfully'
      )
    );
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, 'Cover Image file is Required');
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath, 'image');
  if (!coverImage?.url) {
    throw new ApiError(500, 'Something went wrong uploading Cover Image');
  }

  const removeCoverImage = await removeFromCloudinary(
    req.user?.coverImage,
    'image'
  );

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: coverImage?.url,
      },
    },
    {
      new: true,
    }
  ).select(' -password -refreshToken');

  req.user = user;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { RemoveCoverImage: removeCoverImage, user },
        'Cover Image Updated Successfully'
      )
    );
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  console.log(username);
  console.log(Boolean(username?.trim()));

  if (!username?.trim()) {
    throw new ApiError(400, 'UserName is Missing');
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username,
      },
    },
    {
      $lookup: {
        from: 'Subscriptions',
        localField: '_id',
        foreignField: 'channel',
        as: 'subscribers',
      },
    },
    {
      $lookup: {
        from: 'Subscriptions',
        localField: '_id',
        foreignField: 'subscriber',
        as: 'subscribedTo',
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: '$subscribers',
        },
        channelsSubscribedToCount: {
          $size: '$subscribedTo',
        },
        isSubscribed: {
          if: { $in: [req.user?._id, '$subscribers.subscriber'] },
          then: true,
          else: false,
        },
      },
    },
    {
      $project: {
        username: 1,
        fullName: 1,
        avatar: 1,
        coverImage: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        email: 1,
      },
    },
  ]);

  if (channel?.length) {
    throw new ApiError(404, 'channel does not exist');
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channel[0],
        'User Channel Profile Fetched Successfully'
      )
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: 'Video',
        localField: 'watchHistory',
        foreignField: '_id',
        as: 'watchHistory',
        pipeline: [
          {
            $lookup: {
              from: 'users',
              localField: 'owner',
              foreignField: '_id',
              as: 'owner',
              pipeline: [
                {
                  $project: {
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: '$owner',
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        'Watch History Fetched Successfully'
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
