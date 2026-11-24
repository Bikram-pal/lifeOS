import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/project.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import {
  createProjectSchema,
  updateProjectSchema,
} from '../validators/project.validator.js';

const router = Router();

router.use(protect);

router.get('/', getProjects);
router.post('/', validateRequest(createProjectSchema), createProject);
router.get('/:id', getProjectById);
router.put('/:id', validateRequest(updateProjectSchema), updateProject);
router.delete('/:id', deleteProject);

export default router;
