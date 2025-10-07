import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Palette, Image, Layout, LayoutDashboard } from "lucide-react";
import { ColorPicker } from "@/components/admin/ColorPicker";
import { SectionStyleEditor } from "@/components/admin/SectionStyleEditor";

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

const ThemeManagement = () => {
  const queryClient = useQueryClient();
  const [colors, setColors] = useState<ThemeColors>({});
  const [sectionStyles, setSectionStyles] = useState<SectionStyles>({});
  const [themeName, setThemeName] = useState("");

  const defaultColors: ThemeColors = {
    primary: "215 70% 35%",
    secondary: "15 80% 60%",
    accent: "145 65% 50%",
    background: "0 0% 100%",
    foreground: "222 47% 11%",
    muted: "210 40% 96%",
    border: "214 32% 91%",
  };

  const { data: activeTheme, isLoading } = useQuery({
    queryKey: ["active-theme"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("themes")
        .select("*")
        .eq("is_active", true)
        .single();

      if (error) throw error;
      
      if (data) {
        setColors(data.colors as ThemeColors);
        setSectionStyles(data.section_styles as SectionStyles);
        setThemeName(data.name);
      }
      
      return data;
    },
  });

  const updateThemeMutation = useMutation({
    mutationFn: async () => {
      if (!activeTheme?.id) throw new Error("No active theme found");

      const { error } = await supabase
        .from("themes")
        .update({
          name: themeName,
          colors: colors as any,
          section_styles: sectionStyles as any,
        })
        .eq("id", activeTheme.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-theme"] });
      toast.success("Theme updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update theme: " + error.message);
    },
  });

  const createThemeMutation = useMutation({
    mutationFn: async () => {
      // Deactivate current active theme
      if (activeTheme?.id) {
        await supabase
          .from("themes")
          .update({ is_active: false })
          .eq("id", activeTheme.id);
      }

      // Create new theme
      const { error } = await supabase
        .from("themes")
        .insert({
          name: themeName || "New Theme",
          is_active: true,
          colors: colors as any,
          section_styles: sectionStyles as any,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-theme"] });
      toast.success("New theme created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create theme: " + error.message);
    },
  });

  const handleSave = () => {
    updateThemeMutation.mutate();
  };

  const handleCreateNew = () => {
    createThemeMutation.mutate();
  };

  const handleResetToDefault = () => {
    setColors(defaultColors);
    setSectionStyles({});
    setThemeName("Default Theme");
    toast.success("Theme reset to default values");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Theme Management</h1>
          <p className="text-muted-foreground mt-1">
            Customize your website's look and feel
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleResetToDefault}
          >
            Reset to Default
          </Button>
          <Button 
            variant="outline" 
            onClick={handleCreateNew} 
            disabled={createThemeMutation.isPending}
          >
            {createThemeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add New Theme
          </Button>
          <Button onClick={handleSave} disabled={updateThemeMutation.isPending}>
            {updateThemeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Label>Theme Name</Label>
        <Input
          value={themeName}
          onChange={(e) => setThemeName(e.target.value)}
          placeholder="e.g., School Theme 2025"
          className="max-w-md"
        />
      </div>

      <Tabs defaultValue="colors" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="colors">
            <Palette className="h-4 w-4 mr-2" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="sections">
            <Layout className="h-4 w-4 mr-2" />
            Sections
          </TabsTrigger>
          <TabsTrigger value="borders">
            <Image className="h-4 w-4 mr-2" />
            Borders
          </TabsTrigger>
          <TabsTrigger value="header">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Header
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors">
          <Card>
            <CardHeader>
              <CardTitle>Color Palette</CardTitle>
              <CardDescription>
                Define the main colors for your website. Use HSL format (Hue Saturation Lightness).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ColorPicker
                label="Primary Color"
                value={colors.primary || "215 70% 35%"}
                onChange={(val) => setColors({ ...colors, primary: val })}
                description="Main brand color used for buttons, links, and important elements"
              />
              <ColorPicker
                label="Secondary Color"
                value={colors.secondary || "15 80% 60%"}
                onChange={(val) => setColors({ ...colors, secondary: val })}
                description="Supporting color for accents and secondary elements"
              />
              <ColorPicker
                label="Accent Color"
                value={colors.accent || "145 65% 50%"}
                onChange={(val) => setColors({ ...colors, accent: val })}
                description="Highlight color for special emphasis"
              />
              <ColorPicker
                label="Background Color"
                value={colors.background || "0 0% 100%"}
                onChange={(val) => setColors({ ...colors, background: val })}
              />
              <ColorPicker
                label="Foreground Color"
                value={colors.foreground || "222 47% 11%"}
                onChange={(val) => setColors({ ...colors, foreground: val })}
                description="Main text color"
              />
              <ColorPicker
                label="Muted Color"
                value={colors.muted || "210 40% 96%"}
                onChange={(val) => setColors({ ...colors, muted: val })}
                description="Subtle backgrounds and secondary text"
              />
              <ColorPicker
                label="Border Color"
                value={colors.border || "214 32% 91%"}
                onChange={(val) => setColors({ ...colors, border: val })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sections">
          <div className="space-y-6">
            <SectionStyleEditor
              title="Hero Section"
              value={sectionStyles.hero || {}}
              onChange={(val) => setSectionStyles({ ...sectionStyles, hero: val })}
            />
            <SectionStyleEditor
              title="Features Section"
              value={sectionStyles.features || {}}
              onChange={(val) => setSectionStyles({ ...sectionStyles, features: val })}
            />
            <SectionStyleEditor
              title="Testimonials Section"
              value={sectionStyles.testimonials || {}}
              onChange={(val) => setSectionStyles({ ...sectionStyles, testimonials: val })}
            />
            <SectionStyleEditor
              title="About Section"
              value={sectionStyles.about || {}}
              onChange={(val) => setSectionStyles({ ...sectionStyles, about: val })}
            />
            <SectionStyleEditor
              title="Contact Section"
              value={sectionStyles.contact || {}}
              onChange={(val) => setSectionStyles({ ...sectionStyles, contact: val })}
            />
          </div>
        </TabsContent>

        <TabsContent value="borders">
          <Card>
            <CardHeader>
              <CardTitle>Section Border Images</CardTitle>
              <CardDescription>
                Configure border images in the Sections tab. This tab is for quick access to border-specific settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Use the Sections tab to add decorative border images to each section.
                Border images can create beautiful frames around your content.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="header">
          <Card>
            <CardHeader>
              <CardTitle>Header Styling</CardTitle>
              <CardDescription>
                Customize the header/navbar appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <SectionStyleEditor
                title="Header Background"
                value={sectionStyles.header || {}}
                onChange={(val) => setSectionStyles({ ...sectionStyles, header: val })}
              />
              <div className="space-y-2">
                <Label>Header Height</Label>
                <Input
                  value={sectionStyles.header?.height || "80px"}
                  onChange={(e) =>
                    setSectionStyles({
                      ...sectionStyles,
                      header: { ...sectionStyles.header, height: e.target.value },
                    })
                  }
                  placeholder="e.g., 80px"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ThemeManagement;
