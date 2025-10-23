import { Settings as SettingsIcon } from 'lucide-react';

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Configure application settings and preferences</p>
      </div>

      {/* Placeholder for future settings */}
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <SettingsIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Settings Coming Soon</h3>
        <p className="text-gray-600">
          Application settings and configuration options will be available here.
        </p>
      </div>
    </div>
  );
}
