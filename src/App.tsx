/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { useEffect } from 'react';
import { initializeMockData } from './lib/storage';

import { Dashboard } from './pages/Dashboard';
import { ContentPage } from './pages/Content';
import { ClientsPage } from './pages/Clients';
import { ProjectsPage } from './pages/Projects';
import { NotesPage } from './pages/Notes';
import { AIPage } from './pages/AI';
import { LearningPage } from './pages/Learning';
import { GoalsPage } from './pages/Goals';
import { PortfolioPage } from './pages/Portfolio';
import { FinancePage } from './pages/Finance';
import { MetricsPage } from './pages/Metrics';

export default function App() {
  useEffect(() => {
    initializeMockData();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="content" element={<ContentPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="notes" element={<NotesPage />} />
          <Route path="ai" element={<AIPage />} />
          <Route path="learning" element={<LearningPage />} />
          <Route path="goals" element={<GoalsPage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="metrics" element={<MetricsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
