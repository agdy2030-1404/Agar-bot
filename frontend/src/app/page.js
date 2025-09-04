'use client';

import DashboardComp from '@/components/dashboard/Dashboard';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardComp />
    </ProtectedRoute>
  );
}
