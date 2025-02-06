import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {
  role_type_enum,
  gender_enum,
  marital_status_enum,
  blood_groups_enum,
} from '../utils/TypeEnum.js';

const userSchema = new mongoose.Schema(
  {
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    bonusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bonus',
    },
    employeeDocumentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmployeeDocument',
    },
    reimbushmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reimbursement',
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      index : true,
      unique: true,
      lowercase: true,
      validate: {
        validator: (value) =>
          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value),
        message: 'Please enter a valid email address', //Validating email address if errror Then message
      },
    },
    annualSalary: {
      type: Number,
      default: 0,
    },
    advanceSalary: {
      type: Number,
      default: 0,
    },
    roleType: {
      type: String,
      enum: role_type_enum,
      default: 'employee',
    },
    lastLogin: {
      type: Date,
    },
    dateOfHiring: {
      type: Date,
    },
    title: {
      type: String,
    },
    location: {
      type: String,
    },
    bankName: {
      type: String,
    },
    ifscCode: {
      type: String,
    },
    accountNo: {
      type: String,
    },
    panNo: {
      type: String,
    },
    beneficiaryName: {
      type: String,
    },
    pfStatus: {
      type: Boolean,
      default: false,
    },
    pfUanNo: {
      type: String,
    },
    professionalTax: {
      type: Boolean,
      default: false,
    },
    lwfStatus: {
      type: Boolean,
      default: false,
    },
    esicStatus: {
      type: Boolean,
      default: false,
    },
    esicIpNumber: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    gender: {
      type: String,
      enum: gender_enum,
    },
    dateOfBirth: {
      type: Date,
    },
    personalPhoneNumber: {
      type: String,
    },
    personalEmailAddress: {
      type: String,
    },
    fathersName: {
      type: String,
    },
    fathersDOB: {
      type: Date,
    },
    mothersName: {
      type: String,
    },
    mothersDOB: {
      type: Date,
    },
    spousesName: {
      type: String,
    },
    spousesDOB: {
      type: Date,
    },
    child1Name: {
      type: String,
    },
    child1DOB: {
      type: Date,
    },
    child2Name: {
      type: String,
    },
    child2DOB: {
      type: Date,
    },
    permanentAddress: {
      type: String,
    },
    temporaryAddress: {
      type: String,
    },
    highestEducationalQualification: {
      type: String,
    },
    aadhaarNumber: {
      type: String,
    },
    maritalStatus: {
      type: String,
      enum: marital_status_enum,
    },
    workExperience: {
      type: String,
    },
    previousEmployer: {
      type: String,
    },
    previousDesignation: {
      type: String,
    },
    marriageAnniversary: {
      type: Date,
    },
    emergencyContactName: {
      type: String,
    },
    emergencyContactNumber: {
      type: String,
    },
    bloodGroup: {
      type: String,
      enum: blood_groups_enum,
    },
    nationality: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },
    profileImage: {
      type: String,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);


userSchema.pre('save',async function (next) {
  if(! this.isModified('password')){
      return next();
  }
  this.password = await bcrypt.hash(this.password,10)
  next();
})

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model('User', userSchema);
