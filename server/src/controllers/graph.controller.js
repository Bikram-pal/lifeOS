import { Document } from '../models/Document.js';
import { Note } from '../models/Note.js';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { GraphNode } from '../models/GraphNode.js';
import { GraphEdge } from '../models/GraphEdge.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getGraphData = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Parallel fetch of all connected entities
    const [docs, notes, projects, tasks, savedNodes, savedEdges] = await Promise.all([
      Document.find({ user: userId }).lean(),
      Note.find({ user: userId }).lean(),
      Project.find({ user: userId }).lean(),
      Task.find({ user: userId }).lean(),
      GraphNode.find({ user: userId }).lean(),
      GraphEdge.find({ user: userId }).lean(),
    ]);

    const positionMap = new Map();
    savedNodes.forEach((n) => {
      positionMap.set(n.nodeId, n.position);
    });

    const nodes = [];
    const edges = [];

    // 1. Process Documents
    docs.forEach((d, idx) => {
      const id = `doc-${d._id}`;
      const defaultPos = { x: 80, y: 80 + idx * 160 };
      nodes.push({
        id,
        type: 'custom',
        position: positionMap.get(id) || defaultPos,
        data: {
          nodeType: 'document',
          label: d.title,
          subtitle: `${d.chunkCount || 0} chunks`,
          resourceId: d._id,
          meta: { mimeType: d.mimeType, size: d.fileSize },
        },
      });
    });

    // 2. Process Notes
    notes.forEach((n, idx) => {
      const id = `note-${n._id}`;
      const defaultPos = { x: 380, y: 80 + idx * 160 };
      nodes.push({
        id,
        type: 'custom',
        position: positionMap.get(id) || defaultPos,
        data: {
          nodeType: 'note',
          label: n.title,
          subtitle: n.tags?.length ? `#${n.tags.slice(0, 2).join(' #')}` : 'Captured Note',
          resourceId: n._id,
          meta: { tags: n.tags, content: n.content },
        },
      });

      // Edge: Note to Source Document
      if (n.sourceDocument) {
        edges.push({
          id: `edge-note-doc-${n._id}`,
          source: `doc-${n.sourceDocument}`,
          target: id,
          label: 'cites',
          animated: true,
          style: { stroke: '#8B5CF6' },
        });
      }
    });

    // 3. Process Projects
    projects.forEach((p, idx) => {
      const id = `proj-${p._id}`;
      const defaultPos = { x: 680, y: 80 + idx * 200 };
      nodes.push({
        id,
        type: 'custom',
        position: positionMap.get(id) || defaultPos,
        data: {
          nodeType: 'project',
          label: p.title,
          subtitle: p.status,
          resourceId: p._id,
          meta: { color: p.color || '#6366F1', status: p.status },
        },
      });
    });

    // 4. Process Tasks
    tasks.forEach((t, idx) => {
      const id = `task-${t._id}`;
      const defaultPos = { x: 980, y: 80 + idx * 140 };
      nodes.push({
        id,
        type: 'custom',
        position: positionMap.get(id) || defaultPos,
        data: {
          nodeType: 'task',
          label: t.title,
          subtitle: `${t.priority} • ${t.status}`,
          resourceId: t._id,
          meta: { priority: t.priority, status: t.status, dueDate: t.dueDate },
        },
      });

      // Edge: Task belongs to Project
      if (t.project) {
        edges.push({
          id: `edge-proj-task-${t._id}`,
          source: `proj-${t.project}`,
          target: id,
          label: 'subtask',
          animated: t.status !== 'COMPLETED',
          style: { stroke: '#10B981' },
        });
      }

      // Edge: Task derived from Document
      if (t.sourceDocument) {
        edges.push({
          id: `edge-doc-task-${t._id}`,
          source: `doc-${t.sourceDocument}`,
          target: id,
          label: 'actioned',
          animated: true,
          style: { stroke: '#F59E0B' },
        });
      }
    });

    // 5. Append Custom Saved Edges
    savedEdges.forEach((e) => {
      if (!edges.some((existing) => existing.id === e.edgeId)) {
        edges.push({
          id: e.edgeId,
          source: e.source,
          target: e.target,
          label: e.label || 'connected',
          animated: e.animated,
          style: { stroke: '#6366F1' },
        });
      }
    });

    return sendSuccess(res, 200, 'Knowledge Graph retrieved', {
      nodes,
      edges,
      stats: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        documents: docs.length,
        notes: notes.length,
        projects: projects.length,
        tasks: tasks.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const saveGraphLayout = async (req, res, next) => {
  try {
    const { nodes } = req.body;
    if (!Array.isArray(nodes)) {
      return res.status(400).json({ success: false, message: 'Invalid nodes array' });
    }

    const operations = nodes.map((n) => ({
      updateOne: {
        filter: { user: req.user._id, nodeId: n.id },
        update: {
          $set: {
            position: n.position,
            label: n.data?.label || 'Node',
            type: n.data?.nodeType || 'topic',
          },
        },
        upsert: true,
      },
    }));

    if (operations.length > 0) {
      await GraphNode.bulkWrite(operations);
    }

    return sendSuccess(res, 200, 'Graph layout saved successfully');
  } catch (err) {
    next(err);
  }
};

export const createEdge = async (req, res, next) => {
  try {
    const { edgeId: clientEdgeId, source, target, label } = req.body;
    const edgeId = clientEdgeId || `edge-${source}-${target}-${Date.now()}`;

    // Prevent duplicate edges between the same two nodes
    const existing = await GraphEdge.findOne({
      user: req.user._id,
      $or: [
        { edgeId },
        { source, target },
      ],
    });

    if (existing) {
      return sendSuccess(res, 200, 'Edge already exists', existing);
    }

    const edge = await GraphEdge.create({
      user: req.user._id,
      edgeId,
      source,
      target,
      label: label || 'connected',
      animated: true,
    });

    return sendSuccess(res, 201, 'Edge created', edge);
  } catch (err) {
    next(err);
  }
};

export const deleteEdge = async (req, res, next) => {
  try {
    // Decode URL-encoded edge IDs (e.g. edge-proj-task-... sent with encodeURIComponent)
    const edgeId = decodeURIComponent(req.params.edgeId);

    // 1. Delete the custom edge record (may not exist for auto-generated edges)
    const deleted = await GraphEdge.findOneAndDelete({
      user: req.user._id,
      edgeId,
    });

    // 2. Unbind entity relations based on edge id prefix
    if (edgeId.startsWith('edge-proj-task-')) {
      const taskId = edgeId.replace('edge-proj-task-', '');
      await Task.updateOne({ _id: taskId, user: req.user._id }, { $set: { project: null } });
    } else if (edgeId.startsWith('edge-note-doc-')) {
      const noteId = edgeId.replace('edge-note-doc-', '');
      await Note.updateOne({ _id: noteId, user: req.user._id }, { $set: { sourceDocument: null } });
    } else if (edgeId.startsWith('edge-doc-task-')) {
      const taskId = edgeId.replace('edge-doc-task-', '');
      await Task.updateOne({ _id: taskId, user: req.user._id }, { $set: { sourceDocument: null } });
    }

    // Always return success even if the edge didn't exist in the custom table
    // (auto-generated edges from entity relations are removed via the unbind above)
    return sendSuccess(res, 200, 'Edge removed successfully', { edgeId, deleted: !!deleted });
  } catch (err) {
    next(err);
  }
};
