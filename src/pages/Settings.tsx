import { useState } from 'react';
import { Save, GraduationCap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Settings } from '../types';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { state, dispatch } = useApp();
  const [form, setForm] = useState<Settings>({ ...state.settings });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSave = () => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: form });
    toast.success('Settings saved successfully');
  };

  const fields: { label: string; name: keyof Settings; type?: string; placeholder?: string }[] = [
    { label: 'Academy Name', name: 'academyName', placeholder: 'e.g. Vision Academy' },
    { label: 'Phone Number', name: 'phone', placeholder: '03XXXXXXXXX' },
    { label: 'Email Address', name: 'email', type: 'email', placeholder: 'info@academy.pk' },
    { label: 'Address', name: 'address', placeholder: 'Full academy address' },
    { label: 'Currency Symbol', name: 'currency', placeholder: 'PKR' },
    { label: 'Admission Prefix', name: 'admissionPrefix', placeholder: 'ADM' },
    { label: 'Receipt Prefix', name: 'receiptPrefix', placeholder: 'REC' },
  ];

  return (
    <div className="w-full min-w-0 max-w-2xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure academy preferences</p>
        </div>
      </div>

      <div className="card space-y-5 p-4 sm:p-6">
        {/* Academy Logo Placeholder */}
        <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
            <GraduationCap size={28} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-slate-700">{form.academyName}</p>
            <p className="text-sm text-slate-400 mt-0.5">Academy Logo</p>
            <button className="btn btn-secondary btn-sm mt-2">Change Logo</button>
          </div>
        </div>

        <div className="form-grid">
          {fields.map(f => (
            <div key={f.name} className={f.name === 'address' ? 'md:col-span-2' : ''}>
              <label className="label">{f.label}</label>
              <input
                id={`settings-${f.name}`}
                name={f.name}
                type={f.type || 'text'}
                className="input"
                placeholder={f.placeholder}
                value={form[f.name]}
                onChange={handleChange}
              />
            </div>
          ))}
        </div>

        {/* Preview */}
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Receipt Preview</p>
          <div className="text-center">
            <p className="font-bold text-slate-700">{form.academyName}</p>
            <p className="text-xs text-slate-400 mt-1">{form.address}</p>
            <p className="text-xs text-slate-400">{form.phone} · {form.email}</p>
            <div className="mt-3 text-xs text-slate-500">
              Admission No format: <code className="bg-white px-1.5 py-0.5 rounded border">{form.admissionPrefix}-2026-{String(state.admissionCounter).padStart(4, '0')}</code>
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Receipt No format: <code className="bg-white px-1.5 py-0.5 rounded border">{form.receiptPrefix}-2026-0001</code>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button className="btn btn-primary w-full justify-center sm:w-auto" onClick={handleSave} id="save-settings-btn">
            <Save size={16} /> Save Settings
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="card p-4 mt-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Demo Information</p>
        <p className="text-xs text-slate-500">
          This is a frontend-only demo application. All data is stored in your browser's localStorage.
          Clearing browser storage will reset all data to the default seed values.
        </p>
        <button
          className="btn btn-danger btn-sm mt-3"
          onClick={() => {
            if (confirm('Reset all data to defaults? This cannot be undone.')) {
              localStorage.removeItem('visionAcademy_state_v2');
              localStorage.removeItem('visionAcademy_state');
              window.location.reload();
            }
          }}
          id="reset-data-btn"
        >
          Reset All Data
        </button>
      </div>
    </div>
  );
}
