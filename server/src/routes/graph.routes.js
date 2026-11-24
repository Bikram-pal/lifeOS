import { Router } from 'express';
import {
  getGraphData,
  saveGraphLayout,
  createEdge,
  deleteEdge,
} from '../controllers/graph.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/', getGraphData);
router.post('/layout', saveGraphLayout);
router.post('/edges', createEdge);
// Use wildcard to allow slashes in edgeId after URL-decode
router.delete('/edges/:edgeId(*)', deleteEdge);

export default router;
