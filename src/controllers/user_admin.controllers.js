
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.models.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import {
  role_type_enum,
  gender_enum,
  marital_status_enum,
  blood_groups_enum,
} from '../utils/TypeEnum.js';
import { Bonus } from '../models/bonus.models.js';
import { UserDocument } from '../models/userDocument.models.js';
import { Reimbushment } from '../models/reimbushment.models.js';



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

  if (managerId) {
    const isValidObjectId = await isValidObjectId(managerId);
    if (!isValidObjectId) {
      throw new ApiError(400, 'Invalid managerId');
    }

    const isMangerExists = await User.findById(managerId);

    if (!(isMangerExists || isMangerExists?.roleType !== 'manager')) {
      throw new ApiError(400, 'Invalid managerId');
    }
  }

  if (bonusId) {
    const isValidObjectId = await isValidObjectId(bonusId);
    if (!isValidObjectId) {
      throw new ApiError(400, 'Invalid Bonus Id');
    }

    const isBonusExists = await Bonus.findById(bonusId);

    if (!isBonusExists) {
      throw new ApiError(400, 'Invalid Bonus Id');
    }
  }

  if (employeeDocumentId) {
    const isValidObjectId = await isValidObjectId(employeeDocumentId);
    if (!isValidObjectId) {
      throw new ApiError(400, 'Invalid Employee Document Id');
    }

    const isEmployeeDocumentExists = await UserDocument.findById(employeeDocumentId);

    if (!isEmployeeDocumentExists) {
      throw new ApiError(400, 'Invalid Employee Document Id');
    }
  }

  if (reimbushmentId) {
    const isValidObjectId = await isValidObjectId(reimbushmentId);
    if (!isValidObjectId) {
      throw new ApiError(400, 'Invalid Reimbushment Id');
    }

    const isReimbushmentExists = await Reimbushment.findById(reimbushmentId);

    if (!isReimbushmentExists) {
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

const changeUserType = asyncHandler(async(req , res) => {});

const updateUser = asyncHandler(async (req, res) => {});

const updatePassword = asyncHandler(async (req, res) => {});

const markAsDeleteAccount = asyncHandler(async (req, res) => {});

const deleteUser = asyncHandler(async (req, res) => {});

const getUserList = asyncHandler(async (req, res) => {});

const getActiveUserList = asyncHandler(async (req, res) => {});

const getUserById = asyncHandler(async (req , res) => {});

export {
  registerUser,
  changeUserType,
  updateUser,
  updatePassword,
  markAsDeleteAccount,
  deleteUser,
  getUserList,
  getActiveUserList,
  getUserById,

}