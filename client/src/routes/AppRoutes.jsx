import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '../pages/Landing/LandingPage';
import { LoginPage } from '../pages/Auth/LoginPage';
import { RegisterPage } from '../pages/Auth/RegisterPage';
import { ProtectedRoute } from './ProtectedRoute';
import { AppLayout } from '../components/layout/AppLayout';
import { DashboardPage } from '../pages/Dashboard/DashboardPage';
import { KnowledgeVaultPage } from '../pages/KnowledgeVault/KnowledgeVaultPage';
import { AIWorkspacePage } from '../pages/AIWorkspace/AIWorkspacePage';
import { KnowledgeGraphPage } from '../pages/KnowledgeGraph/KnowledgeGraphPage';
import { ProjectsPage } from '../pages/Projects/ProjectsPage';
import { TasksPage } from '../pages/Tasks/TasksPage';
import { GoalsPage } from '../pages/Goals/GoalsPage';
import { AnalyticsPage } from '../pages/Analytics/AnalyticsPage';
import { SettingsPage } from '../pages/Settings/SettingsPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/vault" element={<KnowledgeVaultPage />} />
          <Route path="/ai" element={<AIWorkspacePage />} />
          <Route path="/graph" element={<KnowledgeGraphPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
