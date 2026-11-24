import { Router } from 'express';
import {
  getDocuments,
  getDocumentById,
  uploadDocument,
  deleteDocument,
} from '../controllers/document.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { uploadSingle } from '../middleware/upload.middleware.js';

const router = Router();

router.use(protect);

router.get('/', getDocuments);
router.post('/upload', uploadSingle, uploadDocument);
router.get('/:id', getDocumentById);
router.delete('/:id', deleteDocument);

export default router;
