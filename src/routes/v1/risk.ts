import { Router } from 'express';
import { assessCompany } from '../../controllers/risk';

const router = Router();

router.post('/', assessCompany);

export default router;