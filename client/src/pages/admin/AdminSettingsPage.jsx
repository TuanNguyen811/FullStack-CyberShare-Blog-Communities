import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Settings,
  Save,
  Globe,
  Bell,
  Shield,
  Mail,
  Database,
  RefreshCw
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'CyberShare',
    siteDescription: 'A modern blogging platform',
    allowRegistration: true,
    requireEmailVerification: false,
    autoApproveComments: true,
    autoApprovePosts: false,
    maxFileSize: 5,
    allowedFileTypes: 'jpg,jpeg,png,gif,webp',
    maintenanceMode: false,
  });

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage system configuration</p>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
          <Globe className="h-5 w-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">General Settings</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Site Name
            </label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Site Description
            </label>
            <textarea
              value={settings.siteDescription}
              onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      </div>

      {/* User Settings */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
          <Shield className="h-5 w-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">User Settings</h2>
        </div>
        <div className="p-6 space-y-4">
          <ToggleSetting
            label="Allow Registration"
            description="Allow new users to register on the platform"
            value={settings.allowRegistration}
            onChange={(v) => setSettings({ ...settings, allowRegistration: v })}
          />
          <ToggleSetting
            label="Require Email Verification"
            description="Users must verify their email before posting"
            value={settings.requireEmailVerification}
            onChange={(v) => setSettings({ ...settings, requireEmailVerification: v })}
          />
        </div>
      </div>

      {/* Content Settings */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
          <Bell className="h-5 w-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">Content Settings</h2>
        </div>
        <div className="p-6 space-y-4">
          <ToggleSetting
            label="Auto-approve Comments"
            description="Comments are published immediately without review"
            value={settings.autoApproveComments}
            onChange={(v) => setSettings({ ...settings, autoApproveComments: v })}
          />
          <ToggleSetting
            label="Auto-approve Posts"
            description="Posts are published immediately without admin review"
            value={settings.autoApprovePosts}
            onChange={(v) => setSettings({ ...settings, autoApprovePosts: v })}
          />
        </div>
      </div>

      {/* Upload Settings */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
          <Database className="h-5 w-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">Upload Settings</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max File Size (MB)
            </label>
            <input
              type="number"
              value={settings.maxFileSize}
              onChange={(e) => setSettings({ ...settings, maxFileSize: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Allowed File Types
            </label>
            <input
              type="text"
              value={settings.allowedFileTypes}
              onChange={(e) => setSettings({ ...settings, allowedFileTypes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="jpg,jpeg,png,gif"
            />
            <p className="text-xs text-gray-500 mt-1">Comma-separated list of allowed extensions</p>
          </div>
        </div>
      </div>

      {/* Maintenance Mode */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
          <Settings className="h-5 w-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">Maintenance</h2>
        </div>
        <div className="p-6">
          <ToggleSetting
            label="Maintenance Mode"
            description="Put the site in maintenance mode (only admins can access)"
            value={settings.maintenanceMode}
            onChange={(v) => setSettings({ ...settings, maintenanceMode: v })}
            danger
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Settings
        </Button>
      </div>
    </div>
  );
}

function ToggleSetting({ label, description, value, onChange, danger = false }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className={`font-medium ${danger ? 'text-red-700' : 'text-gray-900'}`}>{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          value
            ? danger ? 'bg-red-600' : 'bg-blue-600'
            : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
