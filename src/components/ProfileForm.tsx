'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Props {
  initialData: { name: string; birthDate: string; interests: string; timezone: string };
}

export default function ProfileForm({ initialData }: Props) {
  const router = useRouter();
  const [form, setForm]   = useState(initialData);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  };

  const cls = "w-full border border-stone-200 rounded-lg px-4 py-3 text-sm text-stone-700 bg-white focus:outline-none focus:border-stone-400 placeholder:text-stone-300 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {[
        { key: 'name'      as const, label: 'Name',      type: 'text',     ph: 'Your name' },
        { key: 'birthDate' as const, label: 'Birth Date', type: 'date',     ph: '' },
        { key: 'timezone'  as const, label: 'Timezone',   type: 'text',     ph: 'America/New_York' },
      ].map(({ key, label, type, ph }) => (
        <div key={key}>
          <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2"
            style={{ fontFamily: "'DM Sans', system-ui" }}>{label}</label>
          <input type={type} value={form[key]} placeholder={ph}
            onChange={(e) => setForm(p => ({ ...p, [key]: e.target.value }))}
            className={cls} style={{ fontFamily: "'DM Sans', system-ui" }} />
        </div>
      ))}
      <div>
        <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2"
          style={{ fontFamily: "'DM Sans', system-ui" }}>Interests</label>
        <textarea value={form.interests} rows={3}
          placeholder="What draws you to the cycles of nature?"
          onChange={(e) => setForm(p => ({ ...p, interests: e.target.value }))}
          className={`${cls} resize-none`} style={{ fontFamily: "'DM Sans', system-ui" }} />
      </div>
      <button type="submit" disabled={saving}
        className="w-full bg-stone-800 text-white rounded-lg py-3 text-sm tracking-wide hover:bg-stone-700 disabled:opacity-50 transition-colors"
        style={{ fontFamily: "'DM Sans', system-ui" }}>
        {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save profile'}
      </button>
      <div className="text-center">
        <Link href="/" className="text-xs text-stone-300 hover:text-stone-500 transition-colors">← Back to calendar</Link>
      </div>
    </form>
  );
}