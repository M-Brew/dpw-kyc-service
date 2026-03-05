import { Request, Response } from "express";

import KYCApplication from "../models/kycApplication.model";
import AMLFlag from "../models/amlFlag.model";

import { verifyKYCApplication } from '../services/kycVerificationService';

const submitKYC = async (req: Request, res: Response) => {
  const { userId, documentType, documentNumber, documentFrontUrl, documentBackUrl, selfieUrl } = req.body;

  if (!documentType || !documentNumber || !documentFrontUrl || !selfieUrl) {
    return res.status(400).json({ message: 'Missing required KYC document details.' });
  }

  try {
    let kycApplication = await KYCApplication.findOne({ userId });
    if (kycApplication && ['PENDING', 'SUBMITTED', 'IN_REVIEW'].includes(kycApplication.status)) {
      return res.status(400).json({ message: 'A KYC application is already in progress for this user.' });
    }

    // Create or update KYC application record
    kycApplication = await KYCApplication.findOneAndUpdate(
      { userId },
      {
        status: 'SUBMITTED',
        documentType,
        documentNumber,
        documentFrontUrl,
        documentBackUrl,
        selfieUrl,
        rejectionReason: null, // Clear previous rejections
        updatedAt: Date.now(),
      },
      { upsert: true, new: true } // Create if not exists, return updated doc
    );

    // Submit to third-party KYC provider
    const kycProviderResponse = await verifyKYCApplication({
      userId, documentType, documentNumber, documentFrontUrl, selfieUrl
    });

    // Update with provider reference
    kycApplication.kycProviderReference = kycProviderResponse.kycProviderReference;
    await kycApplication.save();

    // Simulate immediate approval/rejection for demo. In real-world, this would be a webhook from provider.
    if (kycProviderResponse.simulatedFinalStatus) {
      kycApplication.status = kycProviderResponse.simulatedFinalStatus as 'PENDING' | 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';
      kycApplication.rejectionReason = kycProviderResponse.simulatedReason;
      await kycApplication.save();
      console.info(`KYC status for user ${userId} updated to: ${kycApplication.status}`);
      // TODO: Publish a Kafka event: { type: 'kyc_status_updated', userId, status: 'APPROVED'/'REJECTED' }
    }

    console.info(`KYC application submitted for user ${userId}. Status: ${kycApplication.status}`);
    res.status(200).json({ message: 'KYC application submitted successfully.', kycApplication });

  } catch (err) {
    console.error(`Error submitting KYC for user ${userId}: ${err.message}`, { error: err });
    res.status(500).json({ message: 'Failed to submit KYC application', details: err.message });
  }
};

const getKYCStatus = async (req: Request, res: Response) => {
  const { userId } = req.body;
  try {
    const kycApplication = await KYCApplication.findOne({ userId });
    if (!kycApplication) {
      return res.status(404).json({ message: 'No KYC application found for this user.' });
    }
    console.info(`Fetched KYC status for user ${userId}: ${kycApplication.status}`);
    res.json({ kycStatus: kycApplication.status, details: kycApplication });
  } catch (err) {
    console.error(`Error fetching KYC status for user ${userId}: ${err.message}`, { error: err });
    res.status(500).json({ message: 'Server error' });
  }
};

// Internal endpoint for AML flags (e.g., for admin/support portal)
const getAMLFlags = async (req: Request, res: Response) => {
  // This endpoint should be highly secured, likely for admin access only
  try {
    const flags = await AMLFlag.find({}); // Get all flags
    console.info(`Fetched ${flags.length} AML flags.`);
    res.json({ flags });
  } catch (err) {
    console.error(`Error fetching AML flags: ${err.message}`, { error: err });
    res.status(500).json({ message: 'Server error' });
  }
};

export default {
  submitKYC,
  getKYCStatus,
  getAMLFlags,
};