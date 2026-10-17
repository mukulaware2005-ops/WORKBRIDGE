import { useEffect, useState } from 'react';
import { Save, RefreshCw, Loader2 } from 'lucide-react';

const API_URL = 'http://127.0.0.1:8000/api/admin/settings/';

export default function Settings() {
  const [settings, setSettings] = useState({
    platformName: 'WorkBridge',
    maintenanceMode: false,
    allowRegistrations: true,
    allowBookings: true,
    allowReviews: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('workbridge_access_token');

  const loadSettings = async () => {
    try {
      setLoading(true);
      setMessage('');

      const response = await fetch(API_URL, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load settings (${response.status})`);
      }

      const data = await response.json();
      setSettings(data);
    } catch (error) {
      setMessage(error.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const saveSettings = async () => {
    try {
      setSaving(true);
      setMessage('');

      const response = await fetch(API_URL, {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to save settings');
      }

      setMessage('Settings updated successfully.');
    } catch (error) {
      setMessage(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <Loader2 className="mx-auto animate-spin text-slate-500" />
          <p className="mt-3 text-slate-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Admin Settings
          </h1>
          <p className="mt-1 text-slate-500">
            Manage WorkBridge platform settings.
          </p>
        </div>

        <button
          onClick={loadSettings}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {message && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-700">
          {message}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">
          Platform Settings
        </h2>

        <div className="mt-6">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Platform Name
          </label>

          <input
            type="text"
            value={settings.platformName}
            onChange={(e) =>
              setSettings({
                ...settings,
                platformName: e.target.value,
              })
            }
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 outline-none focus:ring-2"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">
          Platform Controls
        </h2>

        <div className="mt-6 space-y-5">
          <SettingToggle
            title="Maintenance Mode"
            description="Temporarily disable normal platform activity."
            checked={settings.maintenanceMode}
            onChange={(value) =>
              setSettings({
                ...settings,
                maintenanceMode: value,
              })
            }
          />

          <SettingToggle
            title="Allow Registrations"
            description="Allow new customers and workers to register."
            checked={settings.allowRegistrations}
            onChange={(value) =>
              setSettings({
                ...settings,
                allowRegistrations: value,
              })
            }
          />

          <SettingToggle
            title="Allow Bookings"
            description="Allow customers to create new bookings."
            checked={settings.allowBookings}
            onChange={(value) =>
              setSettings({
                ...settings,
                allowBookings: value,
              })
            }
          />

          <SettingToggle
            title="Allow Reviews"
            description="Allow customers to submit reviews."
            checked={settings.allowReviews}
            onChange={(value) =>
              setSettings({
                ...settings,
                allowReviews: value,
              })
            }
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={18} />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function SettingToggle({ title, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
      <div>
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${
          checked ? 'bg-blue-600' : 'bg-slate-300'
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            checked ? 'left-6' : 'left-1'
          }`}
        />
      </button>
    </div>
  );
}