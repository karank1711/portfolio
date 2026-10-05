import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminLayout } from '@/layouts/AdminLayout.jsx';
import LoginPage from '@/pages/LoginPage.jsx';

const DashboardPage = lazy(() => import('@/pages/DashboardPage.jsx'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage.jsx'));
const AboutPage = lazy(() => import('@/pages/AboutPage.jsx'));
const SkillsPage = lazy(() => import('@/pages/SkillsPage.jsx'));
const ExperiencePage = lazy(() => import('@/pages/ExperiencePage.jsx'));
const EducationPage = lazy(() => import('@/pages/EducationPage.jsx'));
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage.jsx'));
const ProjectEditorPage = lazy(() => import('@/pages/ProjectEditorPage.jsx'));
const AchievementsPage = lazy(() => import('@/pages/AchievementsPage.jsx'));
const ResumePage = lazy(() => import('@/pages/ResumePage.jsx'));
const SocialPage = lazy(() => import('@/pages/SocialPage.jsx'));
const MessagesPage = lazy(() => import('@/pages/MessagesPage.jsx'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage.jsx'));

function Screen({ children }) {
  return <Suspense fallback={<div className="h-40 animate-pulse bg-surface" />}>{children}</Suspense>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Screen><DashboardPage /></Screen>} />
        <Route path="/profile" element={<Screen><ProfilePage /></Screen>} />
        <Route path="/about" element={<Screen><AboutPage /></Screen>} />
        <Route path="/skills" element={<Screen><SkillsPage /></Screen>} />
        <Route path="/experience" element={<Screen><ExperiencePage /></Screen>} />
        <Route path="/education" element={<Screen><EducationPage /></Screen>} />
        <Route path="/projects" element={<Screen><ProjectsPage /></Screen>} />
        <Route path="/projects/new" element={<Screen><ProjectEditorPage /></Screen>} />
        <Route path="/projects/:id/edit" element={<Screen><ProjectEditorPage /></Screen>} />
        <Route path="/achievements" element={<Screen><AchievementsPage /></Screen>} />
        <Route path="/resume" element={<Screen><ResumePage /></Screen>} />
        <Route path="/social" element={<Screen><SocialPage /></Screen>} />
        <Route path="/messages" element={<Screen><MessagesPage /></Screen>} />
        <Route path="/settings" element={<Screen><SettingsPage /></Screen>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
