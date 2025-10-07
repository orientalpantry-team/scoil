import { Link } from "react-router-dom";
import { GraduationCap, Mail, Phone, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/contexts/ThemeContext";

const Footer = () => {
  const { theme } = useTheme();
  const [logo, setLogo] = useState<{ image: string; hoverText: string; title: string } | null>(null);

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

  return (
    <footer 
      className="bg-primary text-primary-foreground mt-auto bg-cover bg-center"
      style={{
        backgroundImage: theme?.section_styles?.footer?.backgroundImage 
          ? `linear-gradient(rgba(0, 0, 0, ${theme.section_styles.footer.overlayOpacity || 0.5}), rgba(0, 0, 0, ${theme.section_styles.footer.overlayOpacity || 0.5})), url(${theme.section_styles.footer.backgroundImage})`
          : undefined,
        borderImage: theme?.section_styles?.footer?.borderImage 
          ? `url(${theme.section_styles.footer.borderImage}) ${theme.section_styles.footer.borderImageSlice || '30'} / ${theme.section_styles.footer.borderImageWidth || '30px'} round`
          : undefined
      }}
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
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
              <span className="font-bold text-xl">{logo?.title || "Our School"}</span>
            </div>
            <p className="text-primary-foreground/80">
              Building future leaders through quality education and values.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/blogs" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Blogs
                </Link>
              </li>
              <li>
                <Link to="/policies" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Policies
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-primary-foreground/80">
                <Mail className="h-4 w-4" />
                <span>info@school.com</span>
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/80">
                <Phone className="h-4 w-4" />
                <span>+1234567890</span>
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/80">
                <MapPin className="h-4 w-4" />
                <span>123 School St</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/60">
          <p>&copy; {new Date().getFullYear()} {logo?.title || "Our School"}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
