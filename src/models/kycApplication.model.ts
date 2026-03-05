import { Schema, model } from "mongoose";

const kycApplicationSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    status: { type: String, enum: ['PENDING', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    documentType: { type: String }, // e.g., 'ID_CARD', 'PASSPORT', 'DRIVERS_LICENSE'
    documentNumber: { type: String },
    documentFrontUrl: { type: String }, // URL to uploaded document (S3/Cloud Storage)
    documentBackUrl: { type: String },
    selfieUrl: { type: String },
    rejectionReason: { type: String },
    kycProviderReference: { type: String }, // Reference from external KYC provider
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: true,
    },
  }
);

const kycApplicationModel = model("KYCApplication", kycApplicationSchema);

export default kycApplicationModel;