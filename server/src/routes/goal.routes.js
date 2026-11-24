import { Router } from 'express';
import {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  updateGoalProgress,
  deleteGoal,
} from '../controllers/goal.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import {
  createGoalSchema,
  updateGoalSchema,
  updateProgressSchema,
} from '../validators/goal.validator.js';

const router = Router();

router.use(protect);

router.get('/', getGoals);
router.post('/', validateRequest(createGoalSchema), createGoal);
router.get('/:id', getGoalById);
router.put('/:id', validateRequest(updateGoalSchema), updateGoal);
router.patch('/:id/progress', validateRequest(updateProgressSchema), updateGoalProgress);
router.delete('/:id', deleteGoal);

export default router;
