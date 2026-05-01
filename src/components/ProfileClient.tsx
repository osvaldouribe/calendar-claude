'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { getTodayInfo, getUserBirthInfo, ELEMENT_COLORS } from '@/lib/cosmic-data';
import type { UserBirthInfo } from '@/lib/cosmic-data';

interface ImportantDate { id: string; label: string; month: number; day: number; year: number | null }

interface Props {
  userEmail:      string;
  userName:       string;
  initialProfile: { name: string; birthDate: string; hemisphere: 'north' | 'south' };
  initialDates:   ImportantDate[];
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const field: React.CSSProperties = {
  width: '100%', padding: '11px 14px', boxSizing: 'border-box',
  border: '1px solid #E8E4DC', borderRadius: '8px',
  fontSize: '14px', color: '#1C1917', background: '#FAFAF9',
  fontFamily: 'var(--font-inter)', outline: 'none',
  appearance: 'none', WebkitAppearance: 'none',
};

const lbl: React.CSSProperties = {
  display: 'block', fontSize: '10px', letterSpacing: '0.12em',
  textTransform: 'uppercase', color: '#A8A29E',
  marginBottom: '6px', fontFamily: 'var(--font-inter)',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <p style={{
        fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase',
        color: '#A8A29E', fontFamily: 'var(--font-inter)',
        marginBottom: '10px', fontWeight: 500,
      }}>{title}</p>
      <div style={{
        background: '#fff', border: '1px solid #E8E4DC',
        borderRadius: '12px', overflow: 'hidden',
      }}>
        {children}
      </div>
    </div>
  );
}

function Row({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{
      padding: '16px 20px',
      borderBottom: last ? 'none' : '1px solid #F0EDE8',
    }}>
      {children}
    </div>
  );
}

export default function ProfileClient({
  userEmail, userName,
  initialProfile, initialDates,
}: Props) {
  const router = useRouter();

  const [profile, setProfile]       = useState(initialProfile);
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [dates, setDates]           = useState<ImportantDate[]>(initialDates);
  const [addOpen, setAddOpen]       = useState(false);
  const [newDate, setNewDate]       = useState({ label: '', month: 1, day: 1, year: '' });
  const [addLoading, setAddLoading] = useState(false);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [editForm, setEditForm]     = useState({ label: '', month: 1, day: 1, year: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const cosmicBirth = useMemo((): UserBirthInfo | null => {
    if (!profile.birthDate) return null;
    try {
      const bd = new Date(profile.birthDate + 'T12:00:00');
      const todayInfo = getTodayInfo(new Date());
      return getUserBirthInfo(bd, todayInfo.element);
    } catch {
      return null;
    }
  }, [profile.birthDate]);

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
        label: newDate.label, month: newDate.month, day: newDate.day,
        year: newDate.year ? parseInt(newDate.year) : null,
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

  function startEdit(d: ImportantDate) {
    setEditingId(d.id);
    setEditForm({ label: d.label, month: d.month, day: d.day, year: d.year ? String(d.year) : '' });
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setEditLoading(true);
    const res = await fetch('/api/important-dates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingId, label: editForm.label,
        month: editForm.month, day: editForm.day,
        year: editForm.year ? parseInt(editForm.year) : null,
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setDates(prev => prev.map(d => d.id === editingId ? updated : d).sort((a, b) => a.month - b.month || a.day - b.day));
      setEditingId(null);
    }
    setEditLoading(false);
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
    if (res.ok) await signOut({ callbackUrl: '/' });
    else setDeleting(false);
  }

  const btn = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '10px 14px', border: '1px solid',
    borderColor: active ? '#1C1917' : '#E8E4DC',
    borderRadius: '8px',
    background: active ? '#1C1917' : '#fff',
    color: active ? '#fff' : '#6B6560',
    fontSize: '13px', fontFamily: 'var(--font-inter)',
    cursor: 'pointer', transition: 'all 0.15s',
  });

  return (
    <div style={{
      minHeight: '100dvh', background: 'var(--bg-cream)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '40px 20px 60px', fontFamily: 'var(--font-inter)',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <Link href="/" style={{ color: '#A8A29E', fontSize: '26px', textDecoration: 'none' }}>◎</Link>
          <h1 style={{
            fontFamily: 'var(--font-serif)', fontWeight: 400,
            fontSize: '26px', color: '#1C1917', margin: '14px 0 4px',
          }}>
            {profile.name || userName || 'Your profile'}
          </h1>
          <p style={{ fontSize: '12px', color: '#A8A29E', letterSpacing: '0.08em' }}>
            {userEmail}
          </p>
        </div>

        {/* Personal */}
        <form onSubmit={saveProfile}>
          <Section title="Personal">
            <Row>
              <label style={lbl}>Name</label>
              <input type="text" value={profile.name} placeholder="Your name"
                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                style={field}
                onFocus={e => e.target.style.borderColor = '#A8A29E'}
                onBlur={e  => e.target.style.borderColor = '#E8E4DC'} />
            </Row>
            <Row>
              <label style={lbl}>Date of birth</label>
              <input type="date" value={profile.birthDate}
                onChange={e => setProfile(p => ({ ...p, birthDate: e.target.value }))}
                style={field}
                onFocus={e => e.target.style.borderColor = '#A8A29E'}
                onBlur={e  => e.target.style.borderColor = '#E8E4DC'} />
            </Row>
            <Row last>
              <label style={lbl}>Hemisphere</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" style={btn(profile.hemisphere === 'north')}
                  onClick={() => setProfile(p => ({ ...p, hemisphere: 'north' }))}>
                  ⬆ Northern
                </button>
                <button type="button" style={btn(profile.hemisphere === 'south')}
                  onClick={() => setProfile(p => ({ ...p, hemisphere: 'south' }))}>
                  ⬇ Southern
                </button>
              </div>
              <p style={{ fontSize: '11px', color: '#A8A29E', margin: '8px 0 0' }}>
                Adjusts the seasons shown on your calendar.
              </p>
            </Row>
          </Section>

          <button type="submit" disabled={saving} style={{
            width: '100%', background: saved ? '#6B50A8' : '#1C1917',
            color: '#fff', border: 'none', borderRadius: '10px',
            padding: '13px', fontSize: '13px', letterSpacing: '0.04em',
            fontFamily: 'var(--font-inter)', cursor: saving ? 'default' : 'pointer',
            opacity: saving ? 0.7 : 1, transition: 'all 0.2s', marginBottom: '28px',
          }}>
            {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save profile'}
          </button>
        </form>

        {/* Cosmic signature */}
        {cosmicBirth && (
          <Section title="Cosmic signature">
            <Row>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '22px', lineHeight: 1 }}>{cosmicBirth.westernSign.symbol}</span>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#1C1917', margin: 0 }}>
                      {cosmicBirth.westernSign.name}
                    </p>
                    <p style={{ fontSize: '11px', color: '#A8A29E', margin: '2px 0 0' }}>
                      {cosmicBirth.westernSign.element.charAt(0).toUpperCase() + cosmicBirth.westernSign.element.slice(1)} · {cosmicBirth.westernSign.planet}
                    </p>
                  </div>
                </div>
                {(() => {
                  const c = ELEMENT_COLORS[cosmicBirth.westernSign.element];
                  return (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '3px 9px', borderRadius: '99px',
                      backgroundColor: c.bg, color: c.text, fontSize: '11px',
                      fontFamily: 'var(--font-inter)',
                    }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: c.dot }} />
                      {cosmicBirth.westernSign.tarot}
                    </span>
                  );
                })()}
              </div>
              <div style={{ borderTop: '1px solid #F0EDE8', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#A8A29E' }}>Chinese year</span>
                  <span style={{ color: '#1C1917' }}>
                    {cosmicBirth.chineseAnimal.glyph} {cosmicBirth.chineseAnimal.name}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#A8A29E' }}>Element</span>
                  <span style={{ color: '#1C1917' }}>{cosmicBirth.chineseElement.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#A8A29E' }}>Trait</span>
                  <span style={{ color: '#1C1917', textAlign: 'right', maxWidth: '55%' }}>
                    {cosmicBirth.chineseAnimal.trait}
                  </span>
                </div>
              </div>
            </Row>
            <Row last>
              <p style={{ fontSize: '12px', fontStyle: 'italic', color: '#6B6560', lineHeight: 1.6, margin: 0 }}>
                {cosmicBirth.personalNote}
              </p>
            </Row>
          </Section>
        )}

        {/* Important dates */}
        <Section title="Important dates">
          {dates.length === 0 && !addOpen && (
            <Row last>
              <p style={{ fontSize: '13px', color: '#A8A29E', margin: 0 }}>
                No dates added yet.
              </p>
            </Row>
          )}
          {dates.map((d, i) => (
            <Row key={d.id} last={i === dates.length - 1 && !addOpen}>
              {editingId === d.id ? (
                <form onSubmit={saveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input type="text" required value={editForm.label}
                    onChange={e => setEditForm(p => ({ ...p, label: e.target.value }))}
                    style={field}
                    onFocus={e => e.target.style.borderColor = '#A8A29E'}
                    onBlur={e  => e.target.style.borderColor = '#E8E4DC'} />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select value={editForm.month}
                      onChange={e => setEditForm(p => ({ ...p, month: parseInt(e.target.value) }))}
                      style={{ ...field, flex: 1 }}>
                      {MONTH_NAMES.map((m, idx) => <option key={m} value={idx + 1}>{m}</option>)}
                    </select>
                    <select value={editForm.day}
                      onChange={e => setEditForm(p => ({ ...p, day: parseInt(e.target.value) }))}
                      style={{ ...field, flex: 1 }}>
                      {Array.from({ length: 31 }, (_, idx) => idx + 1).map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                    <input type="number" placeholder="Year" min={1900} max={2100}
                      value={editForm.year}
                      onChange={e => setEditForm(p => ({ ...p, year: e.target.value }))}
                      style={{ ...field, flex: 1 }}
                      onFocus={e => e.target.style.borderColor = '#A8A29E'}
                      onBlur={e  => e.target.style.borderColor = '#E8E4DC'} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="submit" disabled={editLoading} style={{
                      flex: 1, background: '#1C1917', color: '#fff', border: 'none',
                      borderRadius: '8px', padding: '9px', fontSize: '13px',
                      fontFamily: 'var(--font-inter)', cursor: editLoading ? 'default' : 'pointer',
                      opacity: editLoading ? 0.6 : 1,
                    }}>
                      {editLoading ? 'Saving…' : 'Save'}
                    </button>
                    <button type="button" onClick={() => setEditingId(null)} style={{
                      flex: 1, background: '#fff', color: '#6B6560',
                      border: '1px solid #E8E4DC', borderRadius: '8px',
                      padding: '9px', fontSize: '13px',
                      fontFamily: 'var(--font-inter)', cursor: 'pointer',
                    }}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '14px', color: '#1C1917', margin: 0 }}>{d.label}</p>
                    <p style={{ fontSize: '12px', color: '#A8A29E', margin: '3px 0 0' }}>
                      {MONTH_NAMES[d.month - 1]} {d.day}{d.year ? ` · ${d.year}` : ''}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <button onClick={() => startEdit(d)} aria-label="Edit"
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#C8B8B0', fontSize: '14px', lineHeight: 1,
                        padding: '4px 6px', borderRadius: '4px',
                      }}>✎</button>
                    <button onClick={() => removeDate(d.id)} aria-label="Remove"
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#C8B8B0', fontSize: '20px', lineHeight: 1,
                        padding: '4px 6px', borderRadius: '4px',
                      }}>×</button>
                  </div>
                </div>
              )}
            </Row>
          ))}

          {addOpen && (
            <form onSubmit={addImportantDate}>
              <Row last>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={lbl}>Label</label>
                    <input type="text" required placeholder="e.g. Mom's birthday"
                      value={newDate.label}
                      onChange={e => setNewDate(p => ({ ...p, label: e.target.value }))}
                      style={field}
                      onFocus={e => e.target.style.borderColor = '#A8A29E'}
                      onBlur={e  => e.target.style.borderColor = '#E8E4DC'} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={lbl}>Month</label>
                      <select value={newDate.month}
                        onChange={e => setNewDate(p => ({ ...p, month: parseInt(e.target.value) }))}
                        style={field}>
                        {MONTH_NAMES.map((m, i) => (
                          <option key={m} value={i + 1}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={lbl}>Day</label>
                      <select value={newDate.day}
                        onChange={e => setNewDate(p => ({ ...p, day: parseInt(e.target.value) }))}
                        style={field}>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={lbl}>Year (optional)</label>
                    <input type="number" placeholder="e.g. 1990"
                      value={newDate.year}
                      onChange={e => setNewDate(p => ({ ...p, year: e.target.value }))}
                      min={1900} max={2100} style={field}
                      onFocus={e => e.target.style.borderColor = '#A8A29E'}
                      onBlur={e  => e.target.style.borderColor = '#E8E4DC'} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button type="submit" disabled={addLoading} style={{
                      flex: 1, background: '#1C1917', color: '#fff', border: 'none',
                      borderRadius: '8px', padding: '11px', fontSize: '13px',
                      fontFamily: 'var(--font-inter)', cursor: addLoading ? 'default' : 'pointer',
                      opacity: addLoading ? 0.6 : 1,
                    }}>
                      {addLoading ? 'Adding…' : 'Add date'}
                    </button>
                    <button type="button" style={{
                      flex: 1, background: '#fff', color: '#6B6560',
                      border: '1px solid #E8E4DC', borderRadius: '8px',
                      padding: '11px', fontSize: '13px',
                      fontFamily: 'var(--font-inter)', cursor: 'pointer',
                    }}
                      onClick={() => { setAddOpen(false); setNewDate({ label: '', month: 1, day: 1, year: '' }); }}>
                      Cancel
                    </button>
                  </div>
                </div>
              </Row>
            </form>
          )}
        </Section>

        {!addOpen && (
          <button onClick={() => setAddOpen(true)} style={{
            width: '100%', background: '#fff', color: '#6B6560',
            border: '1px solid #E8E4DC', borderRadius: '10px', padding: '13px',
            fontSize: '13px', fontFamily: 'var(--font-inter)', cursor: 'pointer',
            marginBottom: '28px', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: '6px',
          }}>
            <span style={{ fontSize: '16px', lineHeight: 1 }}>+</span> Add a date
          </button>
        )}

        {/* Account */}
        <Section title="Account">
          <Row>
            <button onClick={handleSignOut} disabled={signingOut} style={{
              background: 'none', border: 'none', padding: 0, width: '100%',
              textAlign: 'left', cursor: signingOut ? 'default' : 'pointer',
              fontSize: '14px', color: '#1C1917',
              fontFamily: 'var(--font-inter)', opacity: signingOut ? 0.5 : 1,
            }}>
              {signingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </Row>
          <Row last>
            {!showDelete ? (
              <button onClick={() => setShowDelete(true)} style={{
                background: 'none', border: 'none', padding: 0, width: '100%',
                textAlign: 'left', cursor: 'pointer',
                fontSize: '14px', color: '#DC2626',
                fontFamily: 'var(--font-inter)',
              }}>
                Delete account…
              </button>
            ) : (
              <div>
                <p style={{ fontSize: '13px', color: '#6B6560', margin: '0 0 14px', lineHeight: 1.5 }}>
                  This will permanently delete your account and all data. This cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleDeleteAccount} disabled={deleting} style={{
                    flex: 1, background: '#DC2626', color: '#fff', border: 'none',
                    borderRadius: '8px', padding: '11px', fontSize: '13px',
                    fontFamily: 'var(--font-inter)', cursor: deleting ? 'default' : 'pointer',
                    opacity: deleting ? 0.6 : 1,
                  }}>
                    {deleting ? 'Deleting…' : 'Yes, delete'}
                  </button>
                  <button onClick={() => setShowDelete(false)} style={{
                    flex: 1, background: '#fff', color: '#6B6560',
                    border: '1px solid #E8E4DC', borderRadius: '8px',
                    padding: '11px', fontSize: '13px',
                    fontFamily: 'var(--font-inter)', cursor: 'pointer',
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
