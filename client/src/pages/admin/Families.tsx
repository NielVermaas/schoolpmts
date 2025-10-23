import { useState, useEffect } from 'react';
import { Plus, Users, UserPlus, School as SchoolIcon, Edit2, Trash2 } from 'lucide-react';

interface School {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  studentId: string;
}

interface Family {
  id: string;
  schoolId: string;
  primaryContact: string;
  email: string;
  phone: string;
  address: string;
  students: Student[];
}

export default function AdminFamilies() {
  // Load schools
  const [schools, setSchools] = useState<School[]>(() => {
    const saved = localStorage.getItem('schools');
    return saved ? JSON.parse(saved) : [];
  });

  // Get selected school
  const [selectedSchool, setSelectedSchool] = useState<string>(() => {
    return localStorage.getItem('selectedSchool') || '';
  });

  const [families, setFamilies] = useState<Family[]>(() => {
    // Load families from localStorage on initial render
    const saved = localStorage.getItem('families');
    return saved ? JSON.parse(saved) : [];
  });

  const [showAddFamily, setShowAddFamily] = useState(false);
  const [showEditFamily, setShowEditFamily] = useState<Family | null>(null);
  const [showAddStudent, setShowAddStudent] = useState<string | null>(null);
  const [showEditStudent, setShowEditStudent] = useState<{ familyId: string; student: Student } | null>(null);
  const [gradePricing, setGradePricing] = useState<any[]>([]);

  // Load grade pricing based on selected school
  useEffect(() => {
    if (selectedSchool) {
      const saved = localStorage.getItem(`pricing_${selectedSchool}`);
      if (saved) {
        setGradePricing(JSON.parse(saved));
      }
    }
  }, [selectedSchool]);

  // Save families to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('families', JSON.stringify(families));
  }, [families]);

  const [newFamily, setNewFamily] = useState({
    schoolId: '',
    primaryContact: '',
    email: '',
    phone: '',
    address: '',
  });

  const [editFamily, setEditFamily] = useState({
    schoolId: '',
    primaryContact: '',
    email: '',
    phone: '',
    address: '',
  });

  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    grade: '',
    studentId: '',
  });

  const [editStudent, setEditStudent] = useState({
    firstName: '',
    lastName: '',
    grade: '',
    studentId: '',
  });

  const handleAddFamily = (e: React.FormEvent) => {
    e.preventDefault();
    const family: Family = {
      id: `family-${Date.now()}`,
      ...newFamily,
      students: [],
    };
    setFamilies([...families, family]);
    setNewFamily({ schoolId: '', primaryContact: '', email: '', phone: '', address: '' });
    setShowAddFamily(false);
  };

  // Filter families by selected school
  const filteredFamilies = selectedSchool
    ? families.filter(f => f.schoolId === selectedSchool)
    : families;

  const currentSchool = schools.find(s => s.id === selectedSchool);

  const handleEditFamily = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditFamily) return;

    setFamilies(families.map(family =>
      family.id === showEditFamily.id
        ? { ...family, ...editFamily }
        : family
    ));
    setEditFamily({ schoolId: '', primaryContact: '', email: '', phone: '', address: '' });
    setShowEditFamily(null);
  };

  const handleAddStudent = (e: React.FormEvent, familyId: string) => {
    e.preventDefault();
    setFamilies(families.map(family => {
      if (family.id === familyId) {
        return {
          ...family,
          students: [
            ...family.students,
            { ...newStudent, id: `student-${Date.now()}` }
          ]
        };
      }
      return family;
    }));
    setNewStudent({ firstName: '', lastName: '', grade: '', studentId: '' });
    setShowAddStudent(null);
  };

  const handleEditStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditStudent) return;

    setFamilies(families.map(family => {
      if (family.id === showEditStudent.familyId) {
        return {
          ...family,
          students: family.students.map(student =>
            student.id === showEditStudent.student.id
              ? { ...student, ...editStudent }
              : student
          )
        };
      }
      return family;
    }));
    setEditStudent({ firstName: '', lastName: '', grade: '', studentId: '' });
    setShowEditStudent(null);
  };

  const handleDeleteStudent = (familyId: string, studentId: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      setFamilies(families.map(family => {
        if (family.id === familyId) {
          return {
            ...family,
            students: family.students.filter(s => s.id !== studentId)
          };
        }
        return family;
      }));
    }
  };

  const openEditFamilyModal = (family: Family) => {
    setEditFamily({
      schoolId: family.schoolId,
      primaryContact: family.primaryContact,
      email: family.email,
      phone: family.phone,
      address: family.address,
    });
    setShowEditFamily(family);
  };

  const openEditStudentModal = (familyId: string, student: Student) => {
    setEditStudent({
      firstName: student.firstName,
      lastName: student.lastName,
      grade: student.grade,
      studentId: student.studentId,
    });
    setShowEditStudent({ familyId, student });

    // Load pricing for the family's school
    const family = families.find(f => f.id === familyId);
    if (family) {
      const saved = localStorage.getItem(`pricing_${family.schoolId}`);
      if (saved) {
        setGradePricing(JSON.parse(saved));
      }
    }
  };

  const openAddStudentModal = (familyId: string) => {
    setShowAddStudent(familyId);

    // Load pricing for the family's school
    const family = families.find(f => f.id === familyId);
    if (family) {
      const saved = localStorage.getItem(`pricing_${family.schoolId}`);
      if (saved) {
        setGradePricing(JSON.parse(saved));
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Families</h1>
          <p className="text-gray-600 mt-2">
            {currentSchool ? `Viewing families for ${currentSchool.name}` : 'Manage families and students/pupils'}
          </p>
        </div>
        <button
          onClick={() => setShowAddFamily(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
          disabled={schools.length === 0}
        >
          <Plus className="w-5 h-5" />
          Add Family
        </button>
      </div>

      {/* No Schools Warning */}
      {schools.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <SchoolIcon className="w-12 h-12 mx-auto mb-3 text-yellow-600" />
          <p className="text-yellow-800 font-medium mb-2">No Schools Available</p>
          <p className="text-yellow-700 text-sm">
            Please go to Schools and create a school before adding families.
          </p>
        </div>
      )}

      {/* Add Family Modal */}
      {showAddFamily && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Family</h2>
            <form onSubmit={handleAddFamily} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School *
                </label>
                <select
                  required
                  value={newFamily.schoolId}
                  onChange={(e) => setNewFamily({ ...newFamily, schoolId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select a school...</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Contact Name
                </label>
                <input
                  type="text"
                  required
                  value={newFamily.primaryContact}
                  onChange={(e) => setNewFamily({ ...newFamily, primaryContact: e.target.value })}
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
                  value={newFamily.email}
                  onChange={(e) => setNewFamily({ ...newFamily, email: e.target.value })}
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
                  value={newFamily.phone}
                  onChange={(e) => setNewFamily({ ...newFamily, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  required
                  value={newFamily.address}
                  onChange={(e) => setNewFamily({ ...newFamily, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                  Add Family
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddFamily(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Student/Pupil</h2>
            <form onSubmit={(e) => handleAddStudent(e, showAddStudent)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={newStudent.firstName}
                  onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={newStudent.lastName}
                  onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade/Year
                </label>
                <select
                  required
                  value={newStudent.grade}
                  onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select a grade...</option>
                  {gradePricing.map((pricing) => (
                    <option key={pricing.grade} value={pricing.grade}>
                      {pricing.grade} - R{(pricing.monthlyFee / 100).toFixed(2)}/month
                    </option>
                  ))}
                </select>
                {newStudent.grade && (
                  <p className="text-xs text-green-600 mt-1">
                    Monthly fee: R{(gradePricing.find(p => p.grade === newStudent.grade)?.monthlyFee / 100 || 0).toFixed(2)}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student ID
                </label>
                <input
                  type="text"
                  required
                  value={newStudent.studentId}
                  onChange={(e) => setNewStudent({ ...newStudent, studentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., STU2024001"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                  Add Student
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddStudent(null)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Family Modal */}
      {showEditFamily && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Family</h2>
            <form onSubmit={handleEditFamily} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School *
                </label>
                <select
                  required
                  value={editFamily.schoolId}
                  onChange={(e) => setEditFamily({ ...editFamily, schoolId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select a school...</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Contact Name
                </label>
                <input
                  type="text"
                  required
                  value={editFamily.primaryContact}
                  onChange={(e) => setEditFamily({ ...editFamily, primaryContact: e.target.value })}
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
                  value={editFamily.email}
                  onChange={(e) => setEditFamily({ ...editFamily, email: e.target.value })}
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
                  value={editFamily.phone}
                  onChange={(e) => setEditFamily({ ...editFamily, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  required
                  value={editFamily.address}
                  onChange={(e) => setEditFamily({ ...editFamily, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditFamily(null)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Student/Pupil</h2>
            <form onSubmit={handleEditStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={editStudent.firstName}
                  onChange={(e) => setEditStudent({ ...editStudent, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={editStudent.lastName}
                  onChange={(e) => setEditStudent({ ...editStudent, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade/Year
                </label>
                <select
                  required
                  value={editStudent.grade}
                  onChange={(e) => setEditStudent({ ...editStudent, grade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select a grade...</option>
                  {gradePricing.map((pricing) => (
                    <option key={pricing.grade} value={pricing.grade}>
                      {pricing.grade} - R{(pricing.monthlyFee / 100).toFixed(2)}/month
                    </option>
                  ))}
                </select>
                {editStudent.grade && (
                  <p className="text-xs text-green-600 mt-1">
                    Monthly fee: R{(gradePricing.find(p => p.grade === editStudent.grade)?.monthlyFee / 100 || 0).toFixed(2)}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student ID
                </label>
                <input
                  type="text"
                  required
                  value={editStudent.studentId}
                  onChange={(e) => setEditStudent({ ...editStudent, studentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., STU2024001"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditStudent(null)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Families List */}
      {selectedSchool && filteredFamilies.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Families Yet</h3>
          <p className="text-gray-600 mb-6">
            Get started by adding your first family to {currentSchool?.name}.
          </p>
          <button
            onClick={() => setShowAddFamily(true)}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            Add Your First Family
          </button>
        </div>
      ) : selectedSchool ? (
        <div className="space-y-4">
          {filteredFamilies.map((family) => (
            <div key={family.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{family.primaryContact}</h3>
                    <button
                      onClick={() => openEditFamilyModal(family)}
                      className="text-gray-500 hover:text-primary-600 p-1"
                      title="Edit family"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">{family.email}</p>
                  <p className="text-sm text-gray-600">{family.phone}</p>
                  <p className="text-sm text-gray-600">{family.address}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    School: {schools.find(s => s.id === family.schoolId)?.name || 'Unknown'}
                  </p>
                </div>
                <button
                  onClick={() => openAddStudentModal(family.id)}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Student
                </button>
              </div>

              {/* Students List */}
              {family.students.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Students/Pupils ({family.students.length})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {family.students.map((student) => (
                      <div
                        key={student.id}
                        className="bg-gray-50 p-3 rounded-lg flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {student.grade} • ID: {student.studentId}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEditStudentModal(family.id, student)}
                            className="text-gray-500 hover:text-primary-600 p-1"
                            title="Edit student"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(family.id, student.id)}
                            className="text-gray-500 hover:text-red-600 p-1"
                            title="Delete student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {family.students.length === 0 && (
                <div className="border-t pt-4 text-center text-gray-500 text-sm">
                  No students added yet. Click "Add Student" to get started.
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
