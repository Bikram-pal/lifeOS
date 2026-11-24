import { Router } from 'express';
import {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
} from '../controllers/note.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { createNoteSchema, updateNoteSchema } from '../validators/note.validator.js';

const router = Router();

router.use(protect);

router.get('/', getNotes);
router.post('/', validateRequest(createNoteSchema), createNote);
router.get('/:id', getNoteById);
router.put('/:id', validateRequest(updateNoteSchema), updateNote);
router.delete('/:id', deleteNote);

export default router;
