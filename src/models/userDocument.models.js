import mongoose from 'mongoose';

// Define the schema for the documents
const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    image_url: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const userDocumentSchema = new mongoose.Schema(
  {
    degree: { type: [documentSchema] },
    aadhaar: { type: documentSchema },
    professionalDocuments: { type: [documentSchema] },
    taxDeductionsSupportingDocuments: { type: [documentSchema] },
    employmentContract: { type: documentSchema },
    previousEmploymentDocuments: { type: [documentSchema] },
    bankAccountDetails: { type: documentSchema },
    employeePhoto: { type: documentSchema },
    employeeFamilyPhoto: { type: documentSchema },
    other: { type: [documentSchema] },
  },
  {
    timestamps: true,
  }
);

export const UserDocument = mongoose.model('UserDocument', userDocumentSchema);
