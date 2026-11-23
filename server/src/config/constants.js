export const APP_CONSTANTS = {
  ROLES: {
    USER: 'user',
    ADMIN: 'admin',
  },
  TASK_STATUS: {
    TODO: 'TODO',
    IN_PROGRESS: 'IN_PROGRESS',
    REVIEW: 'REVIEW',
    COMPLETED: 'COMPLETED',
  },
  TASK_PRIORITY: {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    URGENT: 'URGENT',
  },
  PROJECT_STATUS: {
    PLANNING: 'PLANNING',
    ACTIVE: 'ACTIVE',
    PAUSED: 'PAUSED',
    COMPLETED: 'COMPLETED',
  },
  GOAL_STATUS: {
    NOT_STARTED: 'NOT_STARTED',
    IN_PROGRESS: 'IN_PROGRESS',
    ACHIEVED: 'ACHIEVED',
    OVERDUE: 'OVERDUE',
  },
  GRAPH_NODE_TYPES: {
    DOCUMENT: 'document',
    NOTE: 'note',
    TOPIC: 'topic',
    PROJECT: 'project',
    TASK: 'task',
    GOAL: 'goal',
  },
  DEFAULT_GROQ_MODEL: 'llama-3.3-70b-versatile',
};
