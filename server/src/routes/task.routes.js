import { Router } from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from '../controllers/task.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from '../validators/task.validator.js';

const router = Router();

router.use(protect);

router.get('/', getTasks);
router.post('/', validateRequest(createTaskSchema), createTask);
router.get('/:id', getTaskById);
router.put('/:id', validateRequest(updateTaskSchema), updateTask);
router.patch('/:id/status', validateRequest(updateTaskStatusSchema), updateTaskStatus);
router.delete('/:id', deleteTask);

export default router;
