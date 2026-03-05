import { Router } from "express";

import kycController from "../controllers/kycController";

const router = Router();

router.post('/submit', kycController.submitKYC);
router.get('/status', kycController.getKYCStatus);
router.get('/admin/flags', kycController.getAMLFlags); // Admin-only route

export default router;