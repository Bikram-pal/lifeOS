import mongoose from 'mongoose';
import { Task } from '../models/Task.js';
import { Project } from '../models/Project.js';
import { Document } from '../models/Document.js';
import { DocumentChunk } from '../models/DocumentChunk.js';
import { Note } from '../models/Note.js';
import { Goal } from '../models/Goal.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getAnalyticsReports = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Fetch all resources in parallel
    const [tasks, projects, documents, chunks, notes, goals] = await Promise.all([
      Task.find({ user: userId }).lean(),
      Project.find({ user: userId }).lean(),
      Document.find({ user: userId }).lean(),
      DocumentChunk.find({ user: userId }).lean(),
      Note.find({ user: userId }).lean(),
      Goal.find({ user: userId }).lean(),
    ]);

    // 1. Task Velocity (Last 14 Days)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const velocityMap = new Map();
    for (let i = 0; i < 14; i++) {
      const d = new Date(fourteenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateKey = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      velocityMap.set(dateKey, { date: dayLabel, completed: 0, created: 0 });
    }

    tasks.forEach((t) => {
      const createdDate = new Date(t.createdAt).toISOString().split('T')[0];
      if (velocityMap.has(createdDate)) {
        velocityMap.get(createdDate).created += 1;
      }
      if (t.status === 'COMPLETED' && t.updatedAt) {
        const completedDate = new Date(t.updatedAt).toISOString().split('T')[0];
        if (velocityMap.has(completedDate)) {
          velocityMap.get(completedDate).completed += 1;
        }
      }
    });

    const velocityChart = Array.from(velocityMap.values());

    // 2. Priority Distribution
    const priorityCounts = { LOW: 0, MEDIUM: 0, HIGH: 0, URGENT: 0 };
    tasks.forEach((t) => {
      if (priorityCounts[t.priority] !== undefined) {
        priorityCounts[t.priority] += 1;
      }
    });

    const priorityChart = [
      { name: 'Low', count: priorityCounts.LOW, color: '#64748B' },
      { name: 'Medium', count: priorityCounts.MEDIUM, color: '#3B82F6' },
      { name: 'High', count: priorityCounts.HIGH, color: '#F59E0B' },
      { name: 'Urgent', count: priorityCounts.URGENT, color: '#EF4444' },
    ];

    // 3. Status Distribution
    const statusCounts = { TODO: 0, IN_PROGRESS: 0, REVIEW: 0, COMPLETED: 0 };
    tasks.forEach((t) => {
      if (statusCounts[t.status] !== undefined) {
        statusCounts[t.status] += 1;
      }
    });

    const statusChart = [
      { name: 'To Do', count: statusCounts.TODO, color: '#94A3B8' },
      { name: 'In Progress', count: statusCounts.IN_PROGRESS, color: '#8B5CF6' },
      { name: 'Review', count: statusCounts.REVIEW, color: '#F59E0B' },
      { name: 'Completed', count: statusCounts.COMPLETED, color: '#10B981' },
    ];

    // 4. Project Performance & Progress
    const projectPerformance = projects.map((p) => {
      const projectTasks = tasks.filter(
        (t) => t.project && t.project.toString() === p._id.toString()
      );
      const completed = projectTasks.filter((t) => t.status === 'COMPLETED').length;
      const progress = projectTasks.length > 0 ? Math.round((completed / projectTasks.length) * 100) : 0;
      return {
        id: p._id,
        title: p.title,
        color: p.color || '#6366F1',
        totalTasks: projectTasks.length,
        completedTasks: completed,
        progress,
      };
    });

    // 5. High-level Summary Metrics
    const totalTasks = tasks.length;
    const completedTasks = statusCounts.COMPLETED;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const totalBytes = documents.reduce((acc, d) => acc + (d.fileSize || 0), 0);

    // Productivity Score Index (0-100)
    let score = 50;
    if (completionRate > 50) score += 25;
    if (goals.some((g) => g.status === 'ACHIEVED')) score += 15;
    if (documents.length > 0) score += 10;
    score = Math.min(score, 100);

    return sendSuccess(res, 200, 'Analytics reports computed successfully', {
      summary: {
        productivityScore: score,
        totalTasks,
        completedTasks,
        pendingTasks: totalTasks - completedTasks,
        completionRate,
        totalProjects: projects.length,
        totalDocuments: documents.length,
        totalChunks: chunks.length,
        totalNotes: notes.length,
        totalGoals: goals.length,
        storageBytes: totalBytes,
      },
      velocityChart,
      priorityChart,
      statusChart,
      projectPerformance,
      recommendations: [
        {
          id: 'rec-1',
          type: 'velocity',
          title: 'Weekly Task Cadence',
          text: `You have completed ${completedTasks} tasks across your projects. Focus on clearing pending ${priorityCounts.URGENT + priorityCounts.HIGH} high/urgent items.`,
        },
        {
          id: 'rec-2',
          type: 'vault',
          title: 'Knowledge Base Grounding',
          text: `Your Knowledge Vault holds ${chunks.length} extracted chunks across ${documents.length} documents, powering grounded Groq AI answers.`,
        },
      ],
    });
  } catch (err) {
    next(err);
  }
};
