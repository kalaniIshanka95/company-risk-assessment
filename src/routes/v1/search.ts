import { Router } from 'express';
import { searchCompaniesHandler } from '../../controllers/search';

const router = Router();

router.get('/', searchCompaniesHandler);

export default router;
