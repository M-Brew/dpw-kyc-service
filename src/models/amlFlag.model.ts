import { Schema, model } from "mongoose";

const amlFlagSchema = new Schema(
  {
    userId: { type: String, required: true },
    transactionId: { type: String, unique: true, sparse: true }, // Optional, for transaction-specific flags
    reason: { type: String, required: true }, // e.g., 'HighValueTransaction', 'SanctionListMatch', 'SuspiciousPattern'
    severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
    status: { type: String, enum: ['OPEN', 'REVIEWED', 'CLOSED', 'FALSE_POSITIVE'], default: 'OPEN' },
    details: { type: Object }, // Additional data relevant to the flag
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: true,
    },
  }
);

const amlFlagModel = model("AMLFlag", amlFlagSchema);

export default amlFlagModel;