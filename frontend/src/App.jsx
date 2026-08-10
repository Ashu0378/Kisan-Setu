import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
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

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/" element={<Layout />}>
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
    </LanguageProvider>
  );
}

export default App;
