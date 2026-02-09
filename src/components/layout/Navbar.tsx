import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logo, setLogo] = useState<{ image: string; hoverText: string; title: string } | null>(null);
  const location = useLocation();

  useEffect(() => {
    const fetchLogo = async () => {
      const { data } = await supabase
        .from("sections")
        .select("content")
        .eq("key", "home.logos")
        .single();
      
      if (data?.content && typeof data.content === 'object' && 'image' in data.content) {
        setLogo(data.content as { image: string; hoverText: string; title: string });
      }
    };

    fetchLogo();
  }, []);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/enrollment", label: "Enrollment" },
    { to: "/gallery", label: "Gallery" },
    { to: "/blogs", label: "Blogs" },
    { to: "/calendar", label: "Calendar" },
    { to: "/policies", label: "Policies" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            {logo?.image ? (
              <img 
                src={logo.image} 
                alt={logo.hoverText} 
                className="h-8 w-auto object-contain"
                title={logo.hoverText}
              />
            ) : (
              <GraduationCap className="h-8 w-8" />
            )}
            <span>{logo?.title || "Our School"}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Button
                key={link.to}
                asChild
                variant={isActive(link.to) ? "default" : "ghost"}
              >
                <Link to={link.to}>{link.label}</Link>
              </Button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-2">
            {navLinks.map((link) => (
              <Button
                key={link.to}
                asChild
                variant={isActive(link.to) ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setIsOpen(false)}
              >
                <Link to={link.to}>{link.label}</Link>
              </Button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
