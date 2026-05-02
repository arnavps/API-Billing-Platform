import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from './components/layouts/AuthLayout';
import { PrivateRoute } from './components/layouts/PrivateRoute';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { VerifyEmail } from './pages/auth/VerifyEmail';
import { Dashboard } from './pages/Dashboard';
import { APIDashboard } from './pages/apis/APIDashboard';
import { CreateAPIWizard } from './pages/apis/CreateAPIWizard';
import { APIDetails } from './pages/apis/APIDetails';
import Analytics from './pages/Analytics';
import Plans from './pages/Plans';
import BillingDashboard from './pages/BillingDashboard';
import StripeSuccess from './pages/StripeSuccess';

import { DocsLayout } from './pages/docs/DocsLayout';
import { DocsHome } from './pages/docs/DocsHome';
import { APIDocs } from './pages/docs/APIDocs';
import { APIPlayground } from './pages/docs/APIPlayground';
import { GuidePage } from './pages/docs/GuidePage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
        </Route>

        {/* Documentation Portal (Public) */}
        <Route path="/docs" element={<DocsLayout />}>
          <Route index element={<DocsHome />} />
          <Route path="apis/:slug" element={<APIDocs />} />
          <Route path="playground" element={<APIPlayground />} />
          <Route path=":id" element={<GuidePage />} />
        </Route>

        {/* Private Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/apis" element={<APIDashboard />} />
          <Route path="/apis/new" element={<CreateAPIWizard />} />
          <Route path="/apis/:id" element={<APIDetails />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/billing/success" element={<StripeSuccess />} />
          <Route path="/dashboard/settings/billing" element={<BillingDashboard />} />
          {/* Default redirect for authenticated users */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* Catch all unauthenticated */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
