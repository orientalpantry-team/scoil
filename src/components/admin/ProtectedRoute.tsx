import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    checkAccess();
  }, [location.pathname]);

  const checkAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      // Check user role
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error || !data) {
        setHasAccess(false);
        setUserRole(null);
      } else {
        setUserRole(data.role);
        
        // Check route-specific access
        const path = location.pathname;
        const role = data.role;
        
        // Users can only access dashboard
        if (role === "user" && path !== "/admin") {
          setHasAccess(false);
        }
        // Editors can't access user management
        else if (role === "editor" && path === "/admin/users") {
          setHasAccess(false);
        }
        // Admin has full access
        else if (role === "admin" || role === "editor" || role === "user") {
          setHasAccess(true);
        } else {
          setHasAccess(false);
        }
      }
    } catch (error) {
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (hasAccess === false) {
    // If user has a role but no access to this specific route, redirect to their allowed page
    if (userRole === "user") {
      return location.pathname !== "/admin" ? <Navigate to="/admin" replace /> : <Navigate to="/auth?error=access_denied" replace />;
    }
    if (userRole === "editor") {
      return location.pathname === "/admin/users" ? <Navigate to="/admin" replace /> : <Navigate to="/auth?error=access_denied" replace />;
    }
    return <Navigate to="/auth?error=access_denied" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
