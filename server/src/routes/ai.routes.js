import { Router } from 'express';
import {
  getConversations,
  getConversationMessages,
  createConversation,
  deleteConversation,
  chat,
  extractTasks,
  approveTask,
} from '../controllers/ai.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { chatSchema, extractTasksSchema, approveTaskSchema } from '../validators/ai.validator.js';

const router = Router();

router.use(protect);

router.get('/conversations', getConversations);
router.post('/conversations', createConversation);
router.get('/conversations/:id/messages', getConversationMessages);
router.delete('/conversations/:id', deleteConversation);

router.post('/chat', validateRequest(chatSchema), chat);
router.post('/extract-tasks', validateRequest(extractTasksSchema), extractTasks);
router.post('/approve-task', validateRequest(approveTaskSchema), approveTask);

export default router;
