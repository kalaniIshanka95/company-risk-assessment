import { Router } from 'express';
import { verifySecret } from '../../middleware/verifySecret';
import { validateSearchInput } from '../../controllers/search/validateSearchInput';
import { searchCompaniesHandler } from '../../controllers/search';

const router = Router();

router.get(
  '/',
  verifySecret,
  validateSearchInput,
  searchCompaniesHandler,
);

export default router;
