'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

interface ImportantDate { id: string; label: string; month: number; day: number; year: number | null }

interface Props {
  userEmail:     string;
  userName:      string;
  emailVerified: boolean;
  initialProfile: { name: string; birthDate: string; hemisphere: 'north' | 'south' };
  initialDates:  ImportantDate[];
}

const INTER = "'Inter', system-ui, sans-serif";
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const inputCls = "w-full border border-stone-200 rounded-lg px-4 py-3 text-sm text-stone-700 bg-white focus:outline-none focus:border-stone-400 placeholder:text-stone-300 transition-colors";
const labelCls = "block text-xs tracking-widest uppercase text-stone-400 mb-2";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <p style={{
        fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase',
        color: '#A8A29E', fontFamily: INTER, marginBottom: '12px', fontWeight: 500,
      }}>{title}</p>
      <div style={{
        background: '#fff', border: '1px solid #E8E4DC', borderRadius: '12px',
        overflow: 'hidden',
      }}>
        {children}
      </div>
    </div>
  );
}

function Row({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{
      padding: '14px 20px',
      borderBottom: last ? 'none' : '1px solid #F0EDE8',
    }}>
      {children}
    </div>
  );
}

export default function ProfileClient({
  userEmail, userName, emailVerified,
  initialProfile, initialDates,
}: Props) {
  const router = useRouter();

  const [profile, setProfile]     = useState(initialProfile);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);

  const [dates, setDates]         = useState<ImportantDate[]>(initialDates);
  const [addOpen, setAddOpen]     = useState(false);
  const [newDate, setNewDate]     = useState({ label: '', month: 1, day: 1, year: '' });
  const [addLoading, setAddLoading] = useState(false);

  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  async function addImportantDate(e: React.FormEvent) {
    e.preventDefault(); setAddLoading(true);
    const res = await fetch('/api/important-dates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        label: newDate.label,
        month: newDate.month,
        day:   newDate.day,
        year:  newDate.year ? parseInt(newDate.year) : null,
      }),
    });
    if (res.ok) {
      const created = await res.json();
      setDates(prev => [...prev, created].sort((a, b) => a.month - b.month || a.day - b.day));
      setNewDate({ label: '', month: 1, day: 1, year: '' });
      setAddOpen(false);
    }
    setAddLoading(false);
  }

  async function removeDate(id: string) {
    const res = await fetch('/api/important-dates', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) setDates(prev => prev.filter(d => d.id !== id));
  }

  async function handleSignOut() {
    setSigningOut(true);
    await signOut({ callbackUrl: '/' });
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    const res = await fetch('/api/auth/delete-account', { method: 'DELETE' });
    if (res.ok) {
      await signOut({ callbackUrl: '/' });
    } else {
      setDeleting(false);
    }
  }

  const hemisphereBtn = (val: 'north' | 'south', label: string) => {
    const active = profile.hemisphere === val;
    return (
      <button type="button"
        onClick={() => setProfile(p => ({ ...p, hemisphere: val }))}
        style={{
          flex: 1, padding: '10px', border: '1px solid',
          borderColor: active ? '#1C1917' : '#E8E4DC',
          borderRadius: '8px',
          background: active ? '#1C1917' : '#fff',
          color: active ? '#fff' : '#6B6560',
          fontSize: '13px', fontFamily: INTER, cursor: 'pointer',
          transition: 'all 0.15s',
        }}>
        {label}
      </button>
    );
  };

  return (
    <div style={{
      minHeight: '100dvh', background: 'var(--bg-cream)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '40px 20px 60px', fontFamily: 'var(--font-inter)',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ color: '#A8A29E', fontSize: '24px', textDecoration: 'none' }}>◎</Link>
          <h1 style={{
            fontSize: '24px', fontWeight: 400, color: '#1C1917',
            fontFamily: 'var(--font-serif)',
            margin: '12px 0 4px',
          }}>
            {profile.name || userName || 'Your profile'}
          </h1>
          <p style={{ fontSize: '11px', color: '#A8A29E', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {userEmail}
          </p>
          {!emailVerified && (
            <p style={{
              marginTop: '10px', fontSize: '12px', color: '#B45309',
              background: '#FEF3C7', border: '1px solid #FDE68A',
              borderRadius: '8px', padding: '6px 12px', display: 'inline-block',
            }}>
              Check your email to verify your account
            </p>
          )}
        </div>

        {/* Personal info */}
        <form onSubmit={saveProfile}>
          <Section title="Personal">
            <Row>
              <label className={labelCls} style={{ fontFamily: INTER }}>Name</label>
              <input type="text" value={profile.name} placeholder="Your name"
                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                className={inputCls} style={{ fontFamily: INTER }} />
            </Row>
            <Row>
              <label className={labelCls} style={{ fontFamily: INTER }}>Date of birth</label>
              <input type="date" value={profile.birthDate}
                onChange={e => setProfile(p => ({ ...p, birthDate: e.target.value }))}
                className={inputCls} style={{ fontFamily: INTER }} />
            </Row>
            <Row last>
              <label className={labelCls} style={{ fontFamily: INTER }}>Hemisphere</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {hemisphereBtn('north', '⬆ Northern')}
                {hemisphereBtn('south', '⬇ Southern')}
              </div>
              <p style={{ fontSize: '11px', color: '#A8A29E', marginTop: '8px', fontFamily: INTER }}>
                Adjusts the seasons shown on your calendar.
              </p>
            </Row>
          </Section>

          <button type="submit" disabled={saving}
            style={{
              width: '100%', background: '#1C1917', color: '#fff',
              border: 'none', borderRadius: '10px', padding: '14px',
              fontSize: '13px', letterSpacing: '0.05em', cursor: 'pointer',
              opacity: saving ? 0.6 : 1, transition: 'opacity 0.15s',
              fontFamily: INTER, marginBottom: '28px',
            }}>
            {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save profile'}
          </button>
        </form>

        {/* Important dates */}
        <Section title="Important dates">
          {dates.length === 0 && !addOpen && (
            <Row last>
              <p style={{ fontSize: '13px', color: '#A8A29E', fontFamily: INTER }}>
                No dates added yet.
              </p>
            </Row>
          )}
          {dates.map((d, i) => (
            <Row key={d.id} last={i === dates.length - 1 && !addOpen}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '14px', color: '#1C1917', fontFamily: INTER, margin: 0 }}>
                    {d.label}
                  </p>
                  <p style={{ fontSize: '12px', color: '#A8A29E', fontFamily: INTER, margin: '2px 0 0' }}>
                    {MONTH_NAMES[d.month - 1]} {d.day}{d.year ? `, ${d.year}` : ''}
                  </p>
                </div>
                <button
                  onClick={() => removeDate(d.id)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#C8B8B0', fontSize: '18px', padding: '4px 8px',
                    lineHeight: 1,
                  }}
                  aria-label="Remove date">×</button>
              </div>
            </Row>
          ))}

          {/* Add date form */}
          {addOpen && (
            <form onSubmit={addImportantDate}>
              <Row last>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input type="text" required placeholder="Label (e.g. Mom's birthday)"
                    value={newDate.label}
                    onChange={e => setNewDate(p => ({ ...p, label: e.target.value }))}
                    className={inputCls} style={{ fontFamily: INTER }} />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select value={newDate.month}
                      onChange={e => setNewDate(p => ({ ...p, month: parseInt(e.target.value) }))}
                      className={inputCls} style={{ fontFamily: INTER }}>
                      {MONTH_NAMES.map((m, i) => (
                        <option key={m} value={i + 1}>{m}</option>
                      ))}
                    </select>
                    <select value={newDate.day}
                      onChange={e => setNewDate(p => ({ ...p, day: parseInt(e.target.value) }))}
                      className={inputCls} style={{ fontFamily: INTER }}>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <input type="number" placeholder="Year (optional)"
                    value={newDate.year}
                    onChange={e => setNewDate(p => ({ ...p, year: e.target.value }))}
                    min={1900} max={2100}
                    className={inputCls} style={{ fontFamily: INTER }} />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="submit" disabled={addLoading}
                      style={{
                        flex: 1, background: '#1C1917', color: '#fff', border: 'none',
                        borderRadius: '8px', padding: '10px', fontSize: '13px',
                        cursor: 'pointer', opacity: addLoading ? 0.6 : 1, fontFamily: INTER,
                      }}>
                      {addLoading ? 'Adding…' : 'Add'}
                    </button>
                    <button type="button"
                      onClick={() => { setAddOpen(false); setNewDate({ label: '', month: 1, day: 1, year: '' }); }}
                      style={{
                        flex: 1, background: '#fff', color: '#6B6560',
                        border: '1px solid #E8E4DC', borderRadius: '8px',
                        padding: '10px', fontSize: '13px', cursor: 'pointer', fontFamily: INTER,
                      }}>
                      Cancel
                    </button>
                  </div>
                </div>
              </Row>
            </form>
          )}
        </Section>

        {!addOpen && (
          <button
            onClick={() => setAddOpen(true)}
            style={{
              width: '100%', background: '#fff', color: '#6B6560',
              border: '1px solid #E8E4DC', borderRadius: '10px', padding: '13px',
              fontSize: '13px', cursor: 'pointer', fontFamily: INTER, marginBottom: '28px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}>
            <span style={{ fontSize: '18px', lineHeight: 1, marginTop: '-1px' }}>+</span>
            Add a date
          </button>
        )}

        {/* Account actions */}
        <Section title="Account">
          <Row>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              style={{
                width: '100%', background: 'none', border: 'none',
                textAlign: 'left', cursor: 'pointer', padding: 0,
                fontSize: '14px', color: '#1C1917', fontFamily: INTER,
                opacity: signingOut ? 0.5 : 1,
              }}>
              {signingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </Row>
          <Row last>
            {!showDelete ? (
              <button
                onClick={() => setShowDelete(true)}
                style={{
                  width: '100%', background: 'none', border: 'none',
                  textAlign: 'left', cursor: 'pointer', padding: 0,
                  fontSize: '14px', color: '#DC2626', fontFamily: INTER,
                }}>
                Delete account…
              </button>
            ) : (
              <div>
                <p style={{ fontSize: '13px', color: '#6B6560', fontFamily: INTER, marginBottom: '12px' }}>
                  This will permanently delete your account and all your data. This cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleDeleteAccount} disabled={deleting}
                    style={{
                      flex: 1, background: '#DC2626', color: '#fff', border: 'none',
                      borderRadius: '8px', padding: '10px', fontSize: '13px',
                      cursor: 'pointer', opacity: deleting ? 0.6 : 1, fontFamily: INTER,
                    }}>
                    {deleting ? 'Deleting…' : 'Yes, delete'}
                  </button>
                  <button onClick={() => setShowDelete(false)}
                    style={{
                      flex: 1, background: '#fff', color: '#6B6560',
                      border: '1px solid #E8E4DC', borderRadius: '8px',
                      padding: '10px', fontSize: '13px', cursor: 'pointer', fontFamily: INTER,
                    }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </Row>
        </Section>

        <div style={{ textAlign: 'center', marginTop: '8px' }}>
          <Link href="/" style={{ fontSize: '12px', color: '#C8B8B0', textDecoration: 'none' }}>
            ← Back to calendar
          </Link>
        </div>
      </div>
    </div>
  );
}
