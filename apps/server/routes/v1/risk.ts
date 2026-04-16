import { Router } from 'express';
import { validateRiskInput } from '../../controllers/risk/validateRiskInput';
import { companyRiskAssessHandler } from '../../controllers/risk';

const router = Router();

router.get(
    '/',
    validateRiskInput,
    companyRiskAssessHandler,
);

export default router;
