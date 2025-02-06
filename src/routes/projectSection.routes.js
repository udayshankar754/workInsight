import { Router } from 'express';
import {
  createProject,
  getProject,
  getAllProjects,
  getCompletedProjects,
  getInCompletedProjects,
  getProjectsByDueDate,
  getProjectsByPriority,
  getProjectsByStatus,
  getAllProjectByPriority,
  updateProject,
  deleteProject,
  getProjectsByClient,
  getProjectsByApprovedBy,
  chagesInProjectStatus,
  chagesInProjectPriority,
  chagesInProjectDeadline
} from '../controllers/projectSection.controllers.js';

import { verifyJWT , verifyAdminJwt , verifyManagerJWT } from '../middlewares/auth.middlewares.js';

const router = Router();

router.use(verifyJWT);
router.route('/create-project').post(createProject);
router.route('/get-project/:id').get(getProject);
router.route('/get-all-projects').get(getAllProjects);
router.route('/get-completed-projects').get(getCompletedProjects);
router.route('/get-incompleted-projects').get(getInCompletedProjects);
router.route('/get-projects-by-due-date').get(getProjectsByDueDate);
router.route('/get-projects-by-priority').get(getProjectsByPriority);
router.route('/get-projects-by-status').get(getProjectsByStatus);
router.route('/get-all-project-by-priority').get(getAllProjectByPriority);

router.use(verifyManagerJWT) 
router.route('/get-projects-by-client/:clientId').get(getProjectsByClient);
router.route('/get-projects-by-approved-by/:approvedBy').get(getProjectsByApprovedBy);
router.route('/chage-project-status/:id').get(chagesInProjectStatus);
router.route('/chage-project-priority/:id').get(chagesInProjectPriority);
router.route('/chage-project-deadline/:id').get(chagesInProjectDeadline);

router.use(verifyAdminJwt);
router.route('/update-project/:id').put(updateProject);
router.route('/delete-project/:id').delete(deleteProject);

export default router;
