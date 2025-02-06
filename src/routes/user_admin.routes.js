import { Router } from 'express';
import {
  registerUser,
  changeUserType,
  updateUser,
  updatePassword,
  markAsDeleteAccount,
  deleteUser,
  getUserList,
  getActiveUserList,
  getUserById,
} from '../controllers/user_admin.controllers.js';
import { upload } from '../middlewares/multer.middlewares.js';
import { verifyAdminJwt } from '../middlewares/auth.middlewares.js';

const router = Router();

router.use(verifyAdminJwt);

router.route('/register-user').get(registerUser);
router.route('/changeUserType/:id').get(changeUserType);
router.route('/update-user/:id').put(upload.single('image'), updateUser);
router.route('/update-password/:id').put(updatePassword);
router.route('/mark-as-delete/:id').put(markAsDeleteAccount);
router.route('/delete-user/:id').delete(deleteUser);
router.route('/user/:id').get(getUserById);
router.route('/user-list').get(getUserList);
router.route('/active-user-list').get(getActiveUserList);



export default router;
