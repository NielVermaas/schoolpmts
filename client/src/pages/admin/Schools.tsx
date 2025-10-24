import { useState, useEffect } from 'react';
import { Plus, School as SchoolIcon, DollarSign, X, Edit2 } from 'lucide-react';

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
  const [showPricingModal, setShowPricingModal] = useState<string | null>(null);
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

  // Save selected school
  useEffect(() => {
    if (selectedSchool) {
      localStorage.setItem('selectedSchool', selectedSchool);
    }
  }, [selectedSchool]);

  // Load pricing when modal opens
  useEffect(() => {
    if (showPricingModal) {
      const saved = localStorage.getItem(`pricing_${showPricingModal}`);
      setGradePricing(saved ? JSON.parse(saved) : generateDefaultPricing());
    }
  }, [showPricingModal]);

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
    if (!showPricingModal) return;
    localStorage.setItem(`pricing_${showPricingModal}`, JSON.stringify(gradePricing));
    setShowPricingModal(null);
    alert('Pricing saved successfully!');
  };

  const resetToDefaults = () => {
    if (confirm('Reset all pricing to defaults? This cannot be undone.')) {
      const defaults = generateDefaultPricing();
      setGradePricing(defaults);
    }
  };

  const pricingSchool = schools.find(s => s.id === showPricingModal);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-slide-up">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Schools
        </h1>
        <p className="text-gray-600 mt-2 text-lg">Manage schools and configure grade pricing</p>
      </div>

      {/* School Management */}
      <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Schools</h2>
          <button
            onClick={() => setShowAddSchool(true)}
            className="bg-gradient-primary text-white px-6 py-3 rounded-xl hover:shadow-lg flex items-center gap-2 transition-all duration-200 hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Add School
          </button>
        </div>

        {schools.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <SchoolIcon className="w-10 h-10 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No schools yet</h3>
            <p className="text-gray-600 mb-6">Add your first school to get started.</p>
            <button
              onClick={() => setShowAddSchool(true)}
              className="bg-gradient-primary text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              Add Your First School
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schools.map((school) => (
              <div
                key={school.id}
                className={`group relative bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 transition-all duration-300 hover:shadow-soft-xl overflow-hidden ${
                  selectedSchool === school.id
                    ? 'border-primary-400 shadow-lg'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-primary opacity-5 rounded-full -mr-16 -mt-16"></div>

                <div className="relative p-6">
                  <div
                    className="cursor-pointer"
                    onClick={() => setSelectedSchool(school.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <SchoolIcon className="w-6 h-6 text-white" />
                      </div>
                      {selectedSchool === school.id && (
                        <span className="bg-gradient-primary text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg">
                          Selected
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2">{school.name}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-primary-400 rounded-full mr-2"></span>
                        {school.email}
                      </p>
                      <p className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-primary-400 rounded-full mr-2"></span>
                        {school.phone}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPricingModal(school.id);
                    }}
                    className="mt-4 w-full bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-700 px-4 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 border-2 border-transparent hover:border-purple-300"
                  >
                    <DollarSign className="w-4 h-4" />
                    Edit Pricing
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add School Modal */}
      {showAddSchool && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-soft-xl animate-scale-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New School</h2>
            <form onSubmit={handleAddSchool} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  School Name
                </label>
                <input
                  type="text"
                  required
                  value={newSchool.name}
                  onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="e.g., Greenwood High School"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={newSchool.email}
                  onChange={(e) => setNewSchool({ ...newSchool, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="admin@school.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  required
                  value={newSchool.phone}
                  onChange={(e) => setNewSchool({ ...newSchool, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="+27 12 345 6789"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  required
                  value={newSchool.address}
                  onChange={(e) => setNewSchool({ ...newSchool, address: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  rows={3}
                  placeholder="123 School Street, City"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-primary text-white px-6 py-3 rounded-xl hover:shadow-lg font-semibold transition-all duration-200 hover:scale-105"
                >
                  Add School
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddSchool(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pricing Modal */}
      {showPricingModal && pricingSchool && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-soft-xl animate-scale-in max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-8 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Grade Pricing
                  </h2>
                  <p className="text-gray-600 mt-2">
                    Configure monthly fees for {pricingSchool.name}
                  </p>
                </div>
                <button
                  onClick={() => setShowPricingModal(null)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gradePricing.map((pricing, index) => (
                  <div key={pricing.grade} className="group bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-5 hover:border-primary-300 hover:shadow-soft transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-gray-900 text-lg">{pricing.grade}</span>
                      <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <DollarSign className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">R</span>
                      <input
                        type="number"
                        step="0.01"
                        value={(pricing.monthlyFee / 100).toFixed(2)}
                        onChange={(e) => handlePricingChange(index, e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-semibold text-gray-900 transition-all"
                        placeholder="0.00"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 font-medium">per month</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <button
                  onClick={resetToDefaults}
                  className="text-sm text-gray-600 hover:text-gray-900 font-semibold underline transition-colors"
                >
                  Reset to Defaults
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPricingModal(null)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={savePricing}
                    className="px-6 py-3 bg-gradient-primary text-white rounded-xl hover:shadow-lg font-semibold transition-all duration-200 hover:scale-105"
                  >
                    Save Pricing
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
