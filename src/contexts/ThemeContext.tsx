import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ThemeColors {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  foreground?: string;
  muted?: string;
  border?: string;
}

interface SectionStyle {
  backgroundImage?: string;
  overlayOpacity?: number;
  borderImage?: string;
  borderImageSlice?: string;
  borderImageWidth?: string;
}

interface SectionStyles {
  hero?: SectionStyle;
  features?: SectionStyle;
  testimonials?: SectionStyle;
  about?: SectionStyle;
  contact?: SectionStyle;
  header?: SectionStyle & { height?: string };
}

interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
  section_styles: SectionStyles;
}

interface ThemeContextType {
  theme: Theme | null;
  loading: boolean;
  refreshTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTheme = async () => {
    try {
      const { data, error } = await supabase
        .from("themes")
        .select("*")
        .eq("is_active", true)
        .single();

      if (error) throw error;
      
      if (data) {
        setTheme(data as Theme);
        applyTheme(data as Theme);
      }
    } catch (error) {
      console.error("Error fetching theme:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (themeData: Theme) => {
    const root = document.documentElement;
    
    // Apply color variables
    if (themeData.colors) {
      Object.entries(themeData.colors).forEach(([key, value]) => {
        if (value) {
          root.style.setProperty(`--${key}`, value);
        }
      });
    }
  };

  useEffect(() => {
    fetchTheme();

    // Subscribe to theme changes
    const channel = supabase
      .channel("theme-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "themes",
        },
        () => {
          fetchTheme();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, loading, refreshTheme: fetchTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
