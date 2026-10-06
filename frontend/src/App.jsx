import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './dashboard/Layout';
import { Dashboard } from './dashboard/Dashboard';
import { Register } from './auth/Register';
import { SignIn } from './auth/SignIn';
import { Profile } from './modules/profile/Profile';
import { CropPlanner } from './modules/crop-planner/CropPlanner';
import { YieldPredictor } from './modules/yield-predictor/YieldPredictor';
import { ColdGuard } from './modules/coldguard/ColdGuard';
import { MandiOptimizer } from './modules/mandi-optimizer/MandiOptimizer';
import { SellHoldAdvisor } from './modules/sell-hold-advisor/SellHoldAdvisor';
import { SchemeMatch } from './modules/schemematch/SchemeMatch';
import { VoiceAssistant } from './components/VoiceAssistant';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <VoiceAssistant />
          <Routes>
            {/* Public routes */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="crop-planner" element={<CropPlanner />} />
              <Route path="yield-predictor" element={<YieldPredictor />} />
              <Route path="coldguard" element={<ColdGuard />} />
              <Route path="mandi-optimizer" element={<MandiOptimizer />} />
              <Route path="sell-hold" element={<SellHoldAdvisor />} />
              <Route path="schemematch" element={<SchemeMatch />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
