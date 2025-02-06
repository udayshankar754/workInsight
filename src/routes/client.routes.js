import { Router } from 'express';
import {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
} from '../controllers/client.controllers.js';
import { verifyAdminJwt } from '../middlewares/auth.middlewares.js';

const router = Router();

router.use(verifyAdminJwt);

router.route('/create-client').post(createClient);
router.route('/get-client/:id').get(getClientById);
router.route('/get-clients').get(getAllClients);
router.route('/update-client/:id').put(updateClient);
router.route('/delete-client/:id').delete(deleteClient);

export default router;
