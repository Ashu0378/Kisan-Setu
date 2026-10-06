import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Sprout, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, toggleLanguage } = useLanguage();
  const { login } = useAuth();

  // Read success message passed from Register page
  const registeredMsg = location.state?.message || '';
  const registeredPhone = location.state?.phone || '';

  const [formData, setFormData] = useState({ phone: registeredPhone, password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect to the page the user came from, or home
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login({ phone: formData.phone, password: formData.password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || (lang === 'en' ? 'Login failed. Please try again.' : 'लॉगिन विफल। कृपया पुनः प्रयास करें।'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-surface-50 to-brand-100 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <Button variant="outline" size="sm" onClick={toggleLanguage}>
          {lang === 'en' ? 'हिन्दी' : 'English'}
        </Button>
      </div>

      <div className="max-w-md w-full animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg mb-4 animate-slide-up">
            <Sprout className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-700 to-brand-500 bg-clip-text text-transparent animate-slide-up" style={{ animationDelay: '100ms' }}>
            {lang === 'en' ? 'Welcome Back' : 'वापसी पर स्वागत है'}
          </h1>
          <p className="text-surface-500 mt-2 text-center animate-slide-up" style={{ animationDelay: '150ms' }}>
            {lang === 'en' ? 'Sign in to access your smart farm insights.' : 'अपने स्मार्ट फार्म इनसाइट्स तक पहुँचने के लिए साइन इन करें।'}
          </p>
        </div>

        <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <form onSubmit={handleSignIn}>
            <CardContent className="pt-6">
              <div className="space-y-4 animate-fade-in">

              {/* Registration success banner */}
                {registeredMsg && (
                  <div className="flex items-start gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>{registeredMsg}</span>
                  </div>
                )}

                {/* Error banner */}
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">
                    {lang === 'en' ? 'Phone Number' : 'फ़ोन नंबर'}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                    placeholder="9876543210"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">
                    {lang === 'en' ? 'Password' : 'पासवर्ड'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                </div>

                <div className="flex items-center justify-between mt-2">
                  <label className="flex items-center gap-2 text-sm text-surface-600">
                    <input type="checkbox" className="rounded text-brand-600 focus:ring-brand-500" />
                    {lang === 'en' ? 'Remember me' : 'मुझे याद रखें'}
                  </label>
                  <button type="button" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
                    {lang === 'en' ? 'Forgot password?' : 'पासवर्ड भूल गए?'}
                  </button>
                </div>

                <Button type="submit" className="w-full mt-4" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {lang === 'en' ? 'Signing in…' : 'साइन इन हो रहा है…'}
                    </span>
                  ) : (
                    lang === 'en' ? 'Sign In' : 'साइन इन करें'
                  )}
                </Button>

                <div className="mt-4 text-center text-sm text-surface-600">
                  {lang === 'en' ? "Don't have an account?" : "खाता नहीं है?"}{' '}
                  <Link to="/register" className="text-brand-600 hover:text-brand-700 font-bold">
                    {lang === 'en' ? 'Create one now' : 'अभी बनाएं'}
                  </Link>
                </div>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}
