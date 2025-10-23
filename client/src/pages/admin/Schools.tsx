import { useState, useEffect } from 'react';
import { Plus, School as SchoolIcon, Settings as SettingsIcon } from 'lucide-react';

interface School {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}

export default function AdminSchools() {
  const [schools, setSchools] = useState<School[]>(() => {
    const saved = localStorage.getItem('schools');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedSchool, setSelectedSchool] = useState<string>(() => {
    return localStorage.getItem('selectedSchool') || '';
  });

  const [showAddSchool, setShowAddSchool] = useState(false);
  const [newSchool, setNewSchool] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const [gradePricing, setGradePricing] = useState<any[]>([]);

  // Generate default pricing
  const generateDefaultPricing = () => {
    const grades = [];
    let basePrice = 100000; // R1000 in cents
    for (let i = 1; i <= 12; i++) {
      grades.push({
        grade: `Grade ${i}`,
        monthlyFee: Math.round(basePrice)
      });
      basePrice = basePrice * 1.1;
    }
    return grades;
  };

  // Save schools to localStorage
  useEffect(() => {
    localStorage.setItem('schools', JSON.stringify(schools));
  }, [schools]);

  // Load pricing for selected school
  useEffect(() => {
    if (selectedSchool) {
      const saved = localStorage.getItem(`pricing_${selectedSchool}`);
      setGradePricing(saved ? JSON.parse(saved) : generateDefaultPricing());
    }
  }, [selectedSchool]);

  // Save selected school
  useEffect(() => {
    if (selectedSchool) {
      localStorage.setItem('selectedSchool', selectedSchool);
    }
  }, [selectedSchool]);

  const handleAddSchool = (e: React.FormEvent) => {
    e.preventDefault();
    const school: School = {
      id: `school-${Date.now()}`,
      ...newSchool,
      createdAt: new Date().toISOString(),
    };
    setSchools([...schools, school]);
    setNewSchool({ name: '', email: '', phone: '', address: '' });
    setShowAddSchool(false);

    // Auto-select the new school
    setSelectedSchool(school.id);

    // Initialize default pricing for new school
    localStorage.setItem(`pricing_${school.id}`, JSON.stringify(generateDefaultPricing()));
  };

  const handlePricingChange = (index: number, value: string) => {
    const newPricing = [...gradePricing];
    newPricing[index].monthlyFee = Math.round(parseFloat(value || '0') * 100);
    setGradePricing(newPricing);
  };

  const savePricing = () => {
    if (!selectedSchool) {
      alert('Please select a school first');
      return;
    }
    localStorage.setItem(`pricing_${selectedSchool}`, JSON.stringify(gradePricing));
    alert('Pricing saved successfully!');
  };

  const resetToDefaults = () => {
    if (confirm('Reset all pricing to defaults? This cannot be undone.')) {
      const defaults = generateDefaultPricing();
      setGradePricing(defaults);
      if (selectedSchool) {
        localStorage.setItem(`pricing_${selectedSchool}`, JSON.stringify(defaults));
      }
    }
  };

  const currentSchool = schools.find(s => s.id === selectedSchool);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Schools</h1>
        <p className="text-gray-600 mt-2">Manage schools and configure grade pricing</p>
      </div>

      {/* School Management */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Schools</h2>
          <button
            onClick={() => setShowAddSchool(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add School
          </button>
        </div>

        {schools.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <SchoolIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No schools yet. Add your first school to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {schools.map((school) => (
              <div
                key={school.id}
                onClick={() => setSelectedSchool(school.id)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  selectedSchool === school.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{school.name}</h3>
                    <p className="text-sm text-gray-600">{school.email}</p>
                    <p className="text-sm text-gray-600">{school.phone}</p>
                  </div>
                  {selectedSchool === school.id && (
                    <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded">
                      Selected
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add School Modal */}
      {showAddSchool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New School</h2>
            <form onSubmit={handleAddSchool} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Name
                </label>
                <input
                  type="text"
                  required
                  value={newSchool.name}
                  onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={newSchool.email}
                  onChange={(e) => setNewSchool({ ...newSchool, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  required
                  value={newSchool.phone}
                  onChange={(e) => setNewSchool({ ...newSchool, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  required
                  value={newSchool.address}
                  onChange={(e) => setNewSchool({ ...newSchool, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                  Add School
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddSchool(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grade Pricing - Only show if school is selected */}
      {selectedSchool && currentSchool && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Grade Pricing for {currentSchool.name}
              </h2>
              <p className="text-sm text-gray-600 mt-1">Set monthly fees for each grade</p>
            </div>
            <button
              onClick={resetToDefaults}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Reset to Defaults
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gradePricing.map((pricing, index) => (
              <div key={pricing.grade} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{pricing.grade}</span>
                  <SettingsIcon className="w-4 h-4 text-gray-400" />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R</span>
                  <input
                    type="number"
                    step="0.01"
                    value={(pricing.monthlyFee / 100).toFixed(2)}
                    onChange={(e) => handlePricingChange(index, e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">per month</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <button
              onClick={savePricing}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
            >
              Save Pricing
            </button>
          </div>
        </div>
      )}

      {!selectedSchool && schools.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800">Please select a school above to manage its grade pricing.</p>
        </div>
      )}
    </div>
  );
}
