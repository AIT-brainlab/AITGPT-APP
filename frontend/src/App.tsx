import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PolicyDashboardPage from './pages/PolicyDashboardPage';
import PolicyListPage from './pages/PolicyListPage';
import { SSOLoginPage } from './components/SSOLoginPage';

export default function App() {
  const [showSSOPage, setShowSSOPage] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('sso') === 'true') {
      setShowSSOPage(true);
    }
  }, []);

  if (showSSOPage) {
    return <SSOLoginPage />;
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/policydashboard" element={<PolicyDashboardPage />} />
      <Route path="/policies" element={<PolicyListPage />} />
    </Routes>
  );
}
