import React, { useState } from 'react';
import { auth, db } from '../../firebase/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const s = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');
  .auth-root { min-height:100vh; background:#f5f4f0; font-family:'DM Sans',sans-serif; display:flex; align-items:center; justify-content:center; padding:32px 24px; }
  .auth-card { background:#fff; border:1px solid rgba(0,0,0,0.07); border-radius:24px; width:100%; max-width:380px; padding:40px 32px; }
  .auth-title { font-size:26px; font-weight:300; letter-spacing:-0.03em; color:#1a1a1a; margin:0 0 6px; }
  .auth-sub { font-size:13px; color:#888; margin:0 0 32px; }
  .auth-label { display:block; font-size:12px; font-weight:500; letter-spacing:0.06em; text-transform:uppercase; color:#888; margin-bottom:8px; }
  .auth-field { position:relative; margin-bottom:18px; }
  .auth-input { width:100%; font-family:'DM Sans',sans-serif; font-size:14px; color:#1a1a1a; background:#f9f8f5; border:1px solid rgba(0,0,0,0.08); border-radius:10px; padding:12px 44px 12px 14px; outline:none; transition:all 0.18s ease; box-sizing:border-box; }
  .auth-input::placeholder { color:#bbb; }
  .auth-input:focus { border-color:#1a1a1a; box-shadow:0 0 0 3px rgba(26,26,26,0.07); background:#fff; }
  .auth-eye { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#aaa; padding:0; display:flex; }
  .auth-eye:hover { color:#1a1a1a; }
  .auth-error { font-size:13px; color:#c0392b; background:#fdf2f2; border:1px solid #f5c6c6; border-radius:8px; padding:10px 14px; margin-bottom:18px; }
  .auth-submit { width:100%; padding:13px; background:#1a1a1a; color:#fff; border:none; border-radius:10px; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:500; cursor:pointer; transition:background 0.15s ease; margin-bottom:20px; }
  .auth-submit:hover { background:#333; }
  .auth-submit:disabled { opacity:0.5; cursor:not-allowed; }
  .auth-footer { font-size:13px; color:#888; text-align:center; }
  .auth-footer a { color:#1a1a1a; font-weight:500; text-decoration:none; }
`;

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await setDoc(doc(db, 'users', user.uid), { email: form.email, createdAt: new Date().toISOString(), userId: user.uid });
      navigate('/');
    } catch (err) {
      const map = { 'auth/email-already-in-use': 'This email is already registered.', 'auth/invalid-email': 'Invalid email address.', 'auth/weak-password': 'Password is too weak.' };
      setError(map[err.code] || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{s}</style>
      <div className="auth-root">
        <div className="auth-card">
          <h1 className="auth-title">Create account</h1>
          <p className="auth-sub">Join ShopNest today</p>
          <form onSubmit={submit}>
            {error && <div className="auth-error">{error}</div>}
            <label className="auth-label">Email</label>
            <div className="auth-field"><input name="email" type="email" className="auth-input" placeholder="you@example.com" value={form.email} onChange={handle} required disabled={loading} /></div>
            <label className="auth-label">Password</label>
            <div className="auth-field">
              <input name="password" type={showPw ? 'text' : 'password'} className="auth-input" placeholder="Min. 6 characters" value={form.password} onChange={handle} required disabled={loading} />
              <button type="button" className="auth-eye" onClick={() => setShowPw(p => !p)}>{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
            <label className="auth-label">Confirm password</label>
            <div className="auth-field"><input name="confirm" type={showPw ? 'text' : 'password'} className="auth-input" placeholder="Repeat password" value={form.confirm} onChange={handle} required disabled={loading} /></div>
            <button type="submit" className="auth-submit" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</button>
          </form>
          <p className="auth-footer">Have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </>
  );
}