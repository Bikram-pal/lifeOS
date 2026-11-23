import mongoose from 'mongoose';

export class DashboardService {
  static async getSummary(userId) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Dynamic checks on registered models to avoid errors if models are instantiated in upcoming phases
    const Document = mongoose.models.Document;
    const Note = mongoose.models.Note;
    const Project = mongoose.models.Project;
    const Task = mongoose.models.Task;
    const Goal = mongoose.models.Goal;

    const [
      totalDocuments,
      totalNotes,
      activeProjects,
      pendingTasks,
      completedTasks,
      upcomingDeadlines,
      recentActivity,
    ] = await Promise.all([
      Document ? Document.countDocuments({ user: userObjectId }) : 0,
      Note ? Note.countDocuments({ user: userObjectId }) : 0,
      Project ? Project.countDocuments({ user: userObjectId, status: 'ACTIVE' }) : 0,
      Task ? Task.countDocuments({ user: userObjectId, status: { $ne: 'COMPLETED' } }) : 0,
      Task ? Task.countDocuments({ user: userObjectId, status: 'COMPLETED' }) : 0,
      Task
        ? Task.find({
            user: userObjectId,
            status: { $ne: 'COMPLETED' },
            dueDate: { $gte: new Date() },
          })
            .sort({ dueDate: 1 })
            .limit(5)
            .lean()
        : [],
      Task
        ? Task.find({ user: userObjectId })
            .sort({ updatedAt: -1 })
            .limit(5)
            .lean()
        : [],
    ]);

    // Calculate weekly productivity trends (last 7 days completed tasks)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const productivityChart = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dayName = dayNames[d.getDay()];
      productivityChart.push({
        day: dayName,
        date: d.toISOString().split('T')[0],
        completed: 0,
        added: 0,
      });
    }

    if (Task) {
      const tasksCompletedLast7Days = await Task.find({
        user: userObjectId,
        status: 'COMPLETED',
        updatedAt: { $gte: sevenDaysAgo },
      }).lean();

      tasksCompletedLast7Days.forEach((t) => {
        const dateStr = new Date(t.updatedAt).toISOString().split('T')[0];
        const match = productivityChart.find((p) => p.date === dateStr);
        if (match) match.completed += 1;
      });
    }

    return {
      stats: {
        totalDocuments,
        totalNotes,
        activeProjects,
        pendingTasks,
        completedTasks,
        totalTasks: pendingTasks + completedTasks,
        completionRate:
          pendingTasks + completedTasks > 0
            ? Math.round((completedTasks / (pendingTasks + completedTasks)) * 100)
            : 0,
      },
      upcomingDeadlines,
      recentActivity,
      productivityChart,
      insights: [
        {
          id: 'insight-1',
          type: 'productivity',
          title: 'Context-to-Action Readiness',
          description:
            totalDocuments === 0
              ? 'Upload your first document to extract concepts, generate actionable tasks, and link knowledge.'
              : `${totalDocuments} document(s) indexed. Ask Groq AI or click "Context-to-Action" to generate tasks.`,
        },
        {
          id: 'insight-2',
          type: 'tasks',
          title: 'Workflow Rhythm',
          description:
            pendingTasks > 0
              ? `You have ${pendingTasks} pending task(s). Prioritize high-priority items in your Kanban board.`
              : 'All clear! Ready to plan next milestones or extract new action items.',
        },
      ],
    };
  }
}
