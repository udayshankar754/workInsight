import { Router } from 'express';
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
  changeCurrentPassword,
  updateAccountDetails,
  markAsDeleteAccount,
  forgotPassword,
  getCurrentUser
} from '../controllers/user.controllers.js';
import { upload } from '../middlewares/multer.middlewares.js';
import { verifyJWT } from '../middlewares/auth.middlewares.js';
const router = Router();

router.route('/register').post(upload.single('image'), registerUser);
router.route('/login').post(loginUser);

//secrured Routes
router.route('/logout').get(verifyJWT, logoutUser);
router.route('/refresh-token').get(verifyJWT ,refreshAccessToken);
router.route('/change-password').post(verifyJWT, changeCurrentPassword);
router.route('/update-account-details').post(verifyJWT, updateAccountDetails);
router.route('/mark-as-delete').get(verifyJWT, markAsDeleteAccount);
router.route('/forgot-password').post(verifyJWT , forgotPassword);
router.route('/get-current-user').get(verifyJWT , getCurrentUser);


export default router;
