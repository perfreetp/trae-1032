import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import type { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const roleHomePage: Record<UserRole, string> = {
  service: '/process',
  reviewer: '/review',
  manager: '/',
};

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { currentRole, addAuditLog } = useAppStore();
  const location = useLocation();

  useEffect(() => {
    if (!allowedRoles.includes(currentRole)) {
      addAuditLog({
        action: 'unauthorized_access',
        actionName: '尝试访问无权页面',
        operator: '当前用户',
        operatorRole: currentRole,
        targetPage: location.pathname,
        result: 'denied',
      });
    }
  }, [currentRole, allowedRoles, location.pathname, addAuditLog]);

  if (!allowedRoles.includes(currentRole)) {
    const homePage = roleHomePage[currentRole] || '/';
    return <Navigate to={homePage} replace />;
  }

  return <>{children}</>;
}
