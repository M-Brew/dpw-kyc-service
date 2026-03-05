import config from "../config";

// Mock external KYC service
const verifyKYCApplication = async (kycData: IKYCData) => {
  const { userId, documentType, documentNumber, documentFrontUrl, selfieUrl } = kycData;
  try {
    // Simulate API call to a KYC provider like Onfido, Sumsub, Smile ID, etc.
    const response = await fetch(`${config.thirdPartyKycApi.url}/verify-identity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        document_type: documentType,
        document_number: documentNumber,
        document_front_image_url: documentFrontUrl,
        selfie_image_url: selfieUrl,
        api_key: config.thirdPartyKycApi.apiKey,
      }),
    });
    const jsonResponse = await response.json();

    if (jsonResponse.data && jsonResponse.data.status) {
      console.info(`KYC application submitted for user ${userId}. Provider ref: ${jsonResponse.data.reference}`);
      // Simulate asynchronous processing by KYC provider
      const simulatedKycStatus = Math.random() > 0.8 ? 'REJECTED' : 'APPROVED'; // Random outcome
      return {
        status: 'SUBMITTED', // Initial status while provider processes
        kycProviderReference: jsonResponse.data.reference,
        // In a real system, you'd wait for a webhook from the KYC provider
        // and then update the status and trigger a 'kyc_approved' event.
        // For this example, we'll return a simulated final status.
        simulatedFinalStatus: simulatedKycStatus,
        simulatedReason: simulatedKycStatus === 'REJECTED' ? 'Document mismatch' : null
      };
    } else {
      console.warn(`KYC submission failed for user ${userId}: ${JSON.stringify(jsonResponse.data)}`);
      throw new Error(jsonResponse.data.message || 'Third-party KYC submission failed');
    }
  } catch (error) {
    console.error(`Error submitting KYC for user ${userId}: ${error.message}`, { error: error.response?.data || error.message });
    throw new Error(error.response?.data?.message || 'Failed to submit KYC to third-party');
  }
};

interface IKYCData {
  userId: string;
  documentType: string; // e.g., 'ID_CARD', 'PASSPORT', 'DRIVERS_LICENSE'
  documentNumber: string;
  documentFrontUrl: string; // URL to uploaded document (S3/Cloud Storage)
  selfieUrl: string;
}

export { verifyKYCApplication };