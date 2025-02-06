import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.models.js';
import {
  uploadOnCloudinary,
} from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';
import {
  role_type_enum,
  gender_enum,
  marital_status_enum,
  blood_groups_enum,
} from '../utils/TypeEnum.js';
import { options } from '../utils/sharedData.js';

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
    name,
    email,
    roleType,
    title,
    location,
    bankName,
    ifscCode,
    accountNo,
    panNo,
    beneficiaryName,
    pfUanNo,
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

  if ([name, email, password].some((fields) => fields?.trim() === '')) {
    throw new ApiError(400, 'Please fill all the Required fields');
  }

  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ApiError(400, 'Invalid email format');
    }
  }

  if (personalEmailAddress) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(personalEmailAddress)) {
      throw new ApiError(400, 'Invalid personal email format');
    }
  }

  if (roleType) {
    if (!role_type_enum.includes(roleType)) {
      throw new ApiError(400, 'Invalid role type');
    }
  }

  if (gender) {
    if (!gender_enum.includes(gender)) {
      throw new ApiError(400, 'Invalid gender');
    }
  }

  if (maritalStatus) {
    if (!marital_status_enum.includes(maritalStatus)) {
      throw new ApiError(400, 'Invalid marital status');
    }
  }

  if (bloodGroup) {
    if (!blood_groups_enum.includes(bloodGroup)) {
      throw new ApiError(400, 'Invalid blood group');
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
    name,
    email,
    roleType,
    title,
    location,
    bankName,
    ifscCode,
    accountNo,
    panNo,
    beneficiaryName,
    pfUanNo,
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
  const { email, password } = req.body;

  if (!email && !password) {
    throw new ApiError(400, 'Please fill your email and password');
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new ApiError(404, 'User does not exist');
  }

  if (user?.isDeleted == true) {
    throw new ApiError(404, 'User does not exist');
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid User Credentials');
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user?._id
  );

  const loggedInUser = await User.findById(user?._id);

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: {
            _id: loggedInUser?._id,
            name: loggedInUser?.name,
            email: loggedInUser?.email,
            roleType: loggedInUser?.roleType,
            title: loggedInUser?.title,
            isDeleted: loggedInUser?.isDeleted,
          },
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
  req.user = null;

  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, {}, 'User Logged Out Successfully'));
});

// TODO:
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

    const user = await User.findById(decodedToken?._id).select('+refreshToken');

    if (!user) {
      throw new ApiError(401, 'Invalid Refresh Token');
    }

    if (incomingRefreshToken !== user?.refreshToken ) {
      console.log(incomingRefreshToken , "user",user?.refreshToken );
      throw new ApiError(401, 'Refresh Token is Expired or used');
    }

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
            user: {
              _id: loggedInUser?._id,
              name: loggedInUser?.name,
              email: loggedInUser?.email,
              roleType: loggedInUser?.roleType,
              title: loggedInUser?.title,
              isDeleted: loggedInUser?.isDeleted,
            },
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
  const user = await User.findById(req?.user?._id).select('+password');
  const isPasswordCorrect = await user?.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(401, 'Invalid Old Password');
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Password Changed Successfully'));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { name, bankName , ifscCode , accountNo , panNo , beneficiaryName , phoneNumber ,gender , dateOfBirth , personalPhoneNumber , personalEmailAddress , fathersName , fathersDOB, mothersName , mothersDOB , spousesName , spousesDOB , child1Name , child1DOB , child2Name , child2DOB , permanentAddress , temporaryAddress , highestEducationalQualification , maritalStatus,aadhaarNumber , marriageAnniversary , emergencyContactName  , emergencyContactNumber ,bloodGroup , nationality , profileImage  } = req.body;
  // List of fields to validate
const requiredFields = [
  name, bankName, ifscCode, accountNo, panNo, beneficiaryName, phoneNumber, gender,
  dateOfBirth, personalPhoneNumber, personalEmailAddress, fathersName, fathersDOB, mothersName,
  mothersDOB, spousesName, spousesDOB, child1Name, child1DOB, child2Name, child2DOB, permanentAddress,
  temporaryAddress, highestEducationalQualification, maritalStatus, aadhaarNumber, marriageAnniversary,
  emergencyContactName, emergencyContactNumber, bloodGroup, nationality, profileImage
];

// Check if at least one field is provided
const isAnyFieldFilled = requiredFields.some(field => field !== undefined && field !== null && field !== "");

if (!isAnyFieldFilled) {
  throw new ApiError(400, 'Please fill in at least one field to update your account');
}
if (personalEmailAddress) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(personalEmailAddress)) {
    throw new ApiError(400, 'Invalid personal email format');
  }
}

if (maritalStatus) {
  if (!marital_status_enum.includes(maritalStatus)) {
    throw new ApiError(400, 'Invalid marital status');
  }
}

if (bloodGroup) {
  if (!blood_groups_enum.includes(bloodGroup)) {
    throw new ApiError(400, 'Invalid blood group');
  }
}


  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        name,
        bankName,
        ifscCode,
        accountNo,
        panNo,
        beneficiaryName,
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
        maritalStatus,
        aadhaarNumber,
        marriageAnniversary,
        emergencyContactName,
        emergencyContactNumber,
        bloodGroup,
        nationality,
        profileImage,
      },
    },
    {
      new: true,
    }
  );

  res.user = user;

  return res
    .status(200)
    .json(new ApiResponse(200, user, 'Account Details Updated Successfully'));
});

const markAsDeleteAccount = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        isDeleted: true,
      },
    },
    {
      new: true,
    }
  );

  res.user = null;

  return res
   .status(200)
   .clearCookie('accessToken', options)
   .clearCookie('refreshToken', options)
   .json(new ApiResponse(200, {}, 'Account Marked as Deleted Successfully'));
});

const getCurrentUser = asyncHandler(async(req ,res) => {
  return res
 .status(200)
 .json(
      new ApiResponse(200 , req.user , "User Fetched Successfully")
  )
})


// TODO:
const forgotPassword = asyncHandler(async (req, res) => {});


export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  updateAccountDetails,
  markAsDeleteAccount,
  forgotPassword,
  getCurrentUser,
  
};
