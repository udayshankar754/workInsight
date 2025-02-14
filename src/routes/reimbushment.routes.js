import { Router } from 'express';
import {
  createReimbushment,
  updateReimbushment,
  deleteReimbushment,
  getAllReimbushments,
  getReimbushmentById,
} from '../controllers/reimbushment.controllers.js';

import { verifyJWT } from '../middlewares/auth.middlewares.js';
import { upload } from '../middlewares/multer.middlewares.js';

const router = Router();

router.use(verifyJWT);

router.route('/create').post(upload.single('image'),createReimbushment);
router.route('/update/:id').put(upload.single('image'),updateReimbushment);
router.route('/delete/:id').delete(deleteReimbushment);
router.route('/get-reimbushment/:id').get(getReimbushmentById);
router.route('/get-all-reimbushment').get(getAllReimbushments);

export default router;
