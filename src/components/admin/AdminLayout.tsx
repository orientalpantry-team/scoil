import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Image,
  FileCheck,
  MessageSquare,
  Settings,
  LogOut,
  Home,
  Mail,
  Users,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { role } = useUserRole();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      navigate("/auth");
    }
  };

  const allNavItems = [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["user", "editor", "admin"] },
    { path: "/admin/sections", label: "Sections", icon: Settings, roles: ["editor", "admin"] },
    { path: "/admin/blogs", label: "Blogs", icon: FileText, roles: ["editor", "admin"] },
    { path: "/admin/events", label: "Events", icon: Calendar, roles: ["editor", "admin"] },
    { path: "/admin/gallery", label: "Gallery", icon: Image, roles: ["editor", "admin"] },
    { path: "/admin/policies", label: "Policies", icon: FileCheck, roles: ["editor", "admin"] },
    { path: "/admin/testimonials", label: "Testimonials", icon: MessageSquare, roles: ["editor", "admin"] },
    { path: "/admin/contact", label: "Contact Messages", icon: Mail, roles: ["editor", "admin"] },
    { path: "/admin/theme", label: "Theme", icon: Settings, roles: ["admin"] },
    { path: "/admin/users", label: "User Management", icon: Users, roles: ["admin"] },
  ];

  // Filter nav items based on user role
  const navItems = allNavItems.filter(item => 
    role && item.roles.includes(role)
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 h-screen bg-card border-r flex flex-col sticky top-0">
          <div className="p-6 flex-shrink-0">
            <h2 className="text-2xl font-bold text-primary">Admin Panel</h2>
          </div>
          <nav className="flex-1 overflow-y-auto space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="flex-shrink-0 p-4 border-t space-y-2">
            <Link to="/">
              <Button variant="outline" className="w-full justify-start">
                <Home className="h-5 w-5 mr-2" />
                View Site
              </Button>
            </Link>
            <Button
              variant="destructive"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
