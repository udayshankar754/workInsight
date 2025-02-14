import { Router } from 'express';
import {
  createHoliday,
  getAllHolidays,
  getHolidayById,
  updateHoliday,
  deleteHoliday
} from '../controllers/holiday.controllers.js';

import { verifyAdminJwt  } from '../middlewares/auth.middlewares.js';

const router = Router();

router.use(verifyAdminJwt);

router.route('/create-holiday').post(createHoliday);
router.route('/update-holiday/:id').put(updateHoliday);
router.route('/delete-holiday/:id').delete(deleteHoliday);
router.route('/get-holiday/:id').get(getHolidayById);
router.route('/get-all-holidays').get(getAllHolidays);


export default router;
