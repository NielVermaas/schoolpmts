import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-900">School Fee Management</h1>
          <p className="mt-2 text-primary-700">Simplified payment tracking for families and schools</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
