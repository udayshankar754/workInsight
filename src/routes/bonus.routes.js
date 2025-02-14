import { Router } from 'express';
import {
  createBonus,
  getAllBonuses,
  getBonusById,
  updateBonus,
  deleteBonus
} from '../controllers/bonus.controllers.js';

import { verifyAdminJwt, verifyJWT  } from '../middlewares/auth.middlewares.js';
import { upload } from '../middlewares/multer.middlewares.js';

const router = Router();

router.use(verifyJWT);

router.route('/create').post(upload.single('image'),createBonus);
router.route('/update/:id').put(upload.single('image'),updateBonus);
router.route('/delete/:id').delete(deleteBonus);
router.route('/get-bonus/:id').get(getBonusById);
router.route('/get-all-bonus').get(getAllBonuses);


export default router;