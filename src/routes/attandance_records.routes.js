import { Router } from 'express';
import {
  createLoginRecord,
  logoutRecord,
  customUpdateAttendanceRecord,
  deleteAttandanceREcord,
  getAllAttendanceRecords,
  approveAttandanceRecords,
  getuserWiseAttandanceRecords,
  getUser_StatusWiseAttandanceRecords, 
} from '../controllers/attandance_records.controllers.js';

import { verifyJWT , verifyAdminJwt , verifyManagerJWT } from '../middlewares/auth.middlewares.js';

const router = Router();

router.use(verifyJWT);
router.route('/login').post(createLoginRecord);
router.route('/logout/:id').post(logoutRecord);
router.route('/customUpdate/:id').post(customUpdateAttendanceRecord);
router.route('/delete/:id').delete(deleteAttandanceREcord);
router.route('/get-attandance').get(getAllAttendanceRecords);

router.use(verifyAdminJwt);
router.route('/user-wise-attandance/:employeeId').get(getuserWiseAttandanceRecords);
router.route('/user-wise-attandance/:employeeId/:status').get(getUser_StatusWiseAttandanceRecords)
router.route('/update-status/:id/:status').get(approveAttandanceRecords)


export default router;
