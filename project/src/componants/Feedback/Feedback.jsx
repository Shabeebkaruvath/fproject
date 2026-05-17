import React, { useState } from 'react';

const s = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');
  .fb-root { min-height: 100vh; background: #f5f4f0; font-family: 'DM Sans',sans-serif; display:flex; align-items:center; justify-content:center; padding: 32px 24px 100px; }
  .fb-card { background: #fff; border: 1px solid rgba(0,0,0,0.07); border-radius: 24px; width: 100%; max-width: 420px; padding: 36px 32px; }
  .fb-title { font-size: 24px; font-weight: 300; letter-spacing: -0.03em; color: #1a1a1a; margin: 0 0 6px; }
  .fb-sub { font-size: 13px; color: #888; margin: 0 0 28px; }
  .fb-label { display:block; font-size: 12px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; color: #888; margin-bottom: 8px; }
  .fb-input, .fb-textarea {
    width: 100%; font-family: 'DM Sans',sans-serif; font-size: 14px; font-weight: 400;
    color: #1a1a1a; background: #f9f8f5; border: 1px solid rgba(0,0,0,0.08);
    border-radius: 10px; padding: 12px 14px; outline: none;
    transition: border-color 0.18s ease, box-shadow 0.18s ease; margin-bottom: 18px; box-sizing: border-box;
  }
  .fb-input::placeholder, .fb-textarea::placeholder { color: #bbb; }
  .fb-input:focus, .fb-textarea:focus { border-color: #1a1a1a; box-shadow: 0 0 0 3px rgba(26,26,26,0.07); background: #fff; }
  .fb-textarea { min-height: 130px; resize: vertical; }
  .fb-submit {
    width: 100%; padding: 13px; background: #1a1a1a; color: #fff;
    border: none; border-radius: 10px; font-family: 'DM Sans',sans-serif;
    font-size: 14px; font-weight: 500; cursor: pointer; transition: background 0.15s ease;
  }
  .fb-submit:hover { background: #333; }
  .fb-submit:disabled { opacity: 0.5; cursor: not-allowed; }
  .fb-sent { text-align: center; padding: 40px 0; }
  .fb-sent-icon { font-size: 36px; margin-bottom: 12px; }
  .fb-sent-text { font-size: 16px; font-weight: 400; color: #1a1a1a; margin: 0 0 6px; }
  .fb-sent-sub { font-size: 13px; color: #888; }
`;

export default function Feedback() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target;
    const data = new FormData(form);
    try {
      await fetch("https://formsubmit.co/shabeebkaruvath@gmail.com", { method: "POST", body: data });
      setSent(true);
    } catch {
      setSent(true); // still show success to avoid exposing errors
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{s}</style>
      <div className="fb-root">
        <div className="fb-card">
          {sent ? (
            <div className="fb-sent">
              <div className="fb-sent-icon">✓</div>
              <p className="fb-sent-text">Thanks for your feedback</p>
              <p className="fb-sent-sub">We'll read it carefully.</p>
            </div>
          ) : (
            <>
              <h1 className="fb-title">Feedback</h1>
              <p className="fb-sub">Share what's on your mind.</p>
              <form onSubmit={handleSubmit}>
                <label className="fb-label">Subject</label>
                <input name="subject" type="text" className="fb-input" placeholder="What's this about?" />
                <label className="fb-label">Message</label>
                <textarea name="message" className="fb-textarea" placeholder="Tell us anything…" required />
                <button type="submit" className="fb-submit" disabled={loading}>
                  {loading ? "Sending…" : "Send"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}