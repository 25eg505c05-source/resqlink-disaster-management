import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../types/auth';

export const LoginPage: React.FC = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('coordinator@resqlink.org');
  const [password, setPassword] = useState('coord123');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('COORDINATOR');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isRegister) {
        await register({ email, password, fullName, role });
      } else {
        await login({ email, password });
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoUser = (demoEmail: string, demoRole: UserRole) => {
    setEmail(demoEmail);
    setPassword('demo123');
    setIsRegister(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 selection:bg-rose-500 selection:text-white">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(225,29,72,0.15),rgba(255,255,255,0))] pointer-events-none" />

      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-xl bg-rose-600/10 border border-rose-500/20 text-rose-500 mb-2">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
            ResQLink Operations Center
          </h1>
          <p className="text-xs text-slate-400">
            Disaster Response & Resource Management EOC Portal
          </p>
        </div>

        {/* Demo Fast Login Switcher */}
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-2 text-xs">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
            DEVELOPMENT DEMO CREDENTIALS:
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => setDemoUser('admin@resqlink.org', 'ADMIN')}
              className={`px-2 py-1.5 rounded text-[11px] font-mono transition-colors border ${
                email === 'admin@resqlink.org'
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              ADMIN
            </button>
            <button
              type="button"
              onClick={() => setDemoUser('coordinator@resqlink.org', 'COORDINATOR')}
              className={`px-2 py-1.5 rounded text-[11px] font-mono transition-colors border ${
                email === 'coordinator@resqlink.org'
                  ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              COORDINATOR
            </button>
            <button
              type="button"
              onClick={() => setDemoUser('responder@resqlink.org', 'RESPONDER')}
              className={`px-2 py-1.5 rounded text-[11px] font-mono transition-colors border ${
                email === 'responder@resqlink.org'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              RESPONDER
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegister && (
            <div>
              <label className="block text-slate-300 font-medium mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Capt. John Doe"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-medium mb-1">Official Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@resqlink.org"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Access Passcode</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-slate-300 font-medium mb-1">Assigned Operational Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500 font-mono"
              >
                <option value="COORDINATOR">COORDINATOR (Triage & Supplies)</option>
                <option value="RESPONDER">RESPONDER (Field Missions)</option>
                <option value="ADMIN">ADMIN (Full EOC Governance)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{isRegister ? 'Register Account' : 'Authenticate & Enter EOC'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Login / Register */}
        <div className="pt-2 text-center text-xs text-slate-400">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="hover:text-rose-400 transition-colors"
          >
            {isRegister
              ? 'Already registered? Log in here'
              : 'Need a new field account? Register here'}
          </button>
        </div>
      </div>
    </div>
  );
};
