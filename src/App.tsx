import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { VehiclesPage } from './pages/VehiclesPage';
import { CargosPage } from './pages/CargosPage';
import { DriversPage } from './pages/DriversPage';
import { TripsPage } from './pages/TripsPage';
import { CalendarPage } from './pages/CalendarPage';
import { ArchivePage } from './pages/ArchivePage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

const PageRouter: React.FC = () => {
  const { activePage } = useApp();

  switch (activePage) {
    case 'dashboard':
      return <DashboardPage />;
    case 'vehicles':
      return <VehiclesPage />;
    case 'cargos':
      return <CargosPage />;
    case 'drivers':
      return <DriversPage />;
    case 'trips':
      return <TripsPage />;
    case 'calendar':
      return <CalendarPage />;
    case 'archive':
      return <ArchivePage />;
    case 'reports':
      return <ReportsPage />;
    case 'settings':
      return <SettingsPage />;
    default:
      return <DashboardPage />;
  }
};

export function App() {
  return (
    <AppProvider>
      <Layout>
        <PageRouter />
      </Layout>
    </AppProvider>
  );
}

export default App;
