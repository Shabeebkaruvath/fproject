import React, { useState } from 'react';
import { auth } from '../../firebase/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const s = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');
  .auth-root { min-height: 100vh; background: #f5f4f0; font-family: 'DM Sans',sans-serif; display:flex; align-items:center; justify-content:center; padding: 32px 24px; }
  .auth-card { background: #fff; border: 1px solid rgba(0,0,0,0.07); border-radius: 24px; width: 100%; max-width: 380px; padding: 40px 32px; }
  .auth-title { font-size: 26px; font-weight: 300; letter-spacing: -0.03em; color: #1a1a1a; margin: 0 0 6px; }
  .auth-sub { font-size: 13px; color: #888; margin: 0 0 32px; }
  .auth-label { display:block; font-size: 12px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; color: #888; margin-bottom: 8px; }
  .auth-field { position: relative; margin-bottom: 18px; }
  .auth-input {
    width: 100%; font-family: 'DM Sans',sans-serif; font-size: 14px; color: #1a1a1a;
    background: #f9f8f5; border: 1px solid rgba(0,0,0,0.08); border-radius: 10px;
    padding: 12px 44px 12px 14px; outline: none; transition: all 0.18s ease; box-sizing: border-box;
  }
  .auth-input::placeholder { color: #bbb; }
  .auth-input:focus { border-color: #1a1a1a; box-shadow: 0 0 0 3px rgba(26,26,26,0.07); background: #fff; }
  .auth-eye { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#aaa; padding:0; display:flex; }
  .auth-eye:hover { color: #1a1a1a; }
  .auth-error { font-size: 13px; color: #c0392b; background: #fdf2f2; border: 1px solid #f5c6c6; border-radius: 8px; padding: 10px 14px; margin-bottom: 18px; }
  .auth-submit {
    width: 100%; padding: 13px; background: #1a1a1a; color: #fff; border: none;
    border-radius: 10px; font-family: 'DM Sans',sans-serif; font-size: 14px; font-weight: 500;
    cursor: pointer; transition: background 0.15s ease; margin-bottom: 20px;
  }
  .auth-submit:hover { background: #333; }
  .auth-submit:disabled { opacity: 0.5; cursor: not-allowed; }
  .auth-footer { font-size: 13px; color: #888; text-align: center; }
  .auth-footer a { color: #1a1a1a; font-weight: 500; text-decoration: none; }
  .auth-forgot { display:block; text-align:right; font-size:12px; color:#888; text-decoration:none; margin-bottom:20px; }
  .auth-forgot:hover { color: #1a1a1a; }
`;

const ERR_MAP = {
  'auth/user-not-found': 'No account with this email.',
  'auth/wrong-password': 'Incorrect password.',
  'auth/invalid-email': 'Invalid email address.',
  'auth/invalid-credential': 'Email or password is incorrect.',
  'auth/network-request-failed': 'Check your internet connection.',
};

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(ERR_MAP[err.code] || 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{s}</style>
      <div className="auth-root">
        <div className="auth-card">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-sub">Sign in to your account</p>
          <form onSubmit={submit}>
            {error && <div className="auth-error">{error}</div>}
            <label className="auth-label">Email</label>
            <div className="auth-field">
              <input name="email" type="email" className="auth-input" placeholder="you@example.com" value={form.email} onChange={handle} required disabled={loading} />
            </div>
            <label className="auth-label">Password</label>
            <div className="auth-field">
              <input name="password" type={showPw ? 'text' : 'password'} className="auth-input" placeholder="••••••••" value={form.password} onChange={handle} required disabled={loading} />
              <button type="button" className="auth-eye" onClick={() => setShowPw(p => !p)} aria-label={showPw ? 'Hide' : 'Show'}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <Link to="/forgot-password" className="auth-forgot">Forgot password?</Link>
            <button type="submit" className="auth-submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
          </form>
          <p className="auth-footer">No account? <Link to="/register">Create one</Link></p>
        </div>
      </div>
    </>
  );
}