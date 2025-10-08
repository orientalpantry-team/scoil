import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
  footer?: SectionStyle;
  pageTitle?: SectionStyle;
  blogsPage?: SectionStyle;
  eventsPage?: SectionStyle;
  galleryPage?: SectionStyle;
  policiesPage?: SectionStyle;
  calendarPage?: SectionStyle;
}

const ThemeManagement = () => {
  const queryClient = useQueryClient();
  const [colors, setColors] = useState<ThemeColors>({});
  const [sectionStyles, setSectionStyles] = useState<SectionStyles>({});
  const [themeName, setThemeName] = useState("");
  const [showNewThemeDialog, setShowNewThemeDialog] = useState(false);
  const [newThemeName, setNewThemeName] = useState("");
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);

  const defaultColors: ThemeColors = {
    primary: "215 70% 35%",
    secondary: "15 80% 60%",
    accent: "145 65% 50%",
    background: "0 0% 100%",
    foreground: "222 47% 11%",
    muted: "210 40% 96%",
    border: "214 32% 91%",
  };

  // Fetch all themes
  const { data: allThemes, isLoading: loadingThemes } = useQuery({
    queryKey: ["all-themes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("themes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Get active theme
  const activeTheme = allThemes?.find((t) => t.is_active);

  // Get selected theme or default to active
  const selectedTheme = allThemes?.find((t) => t.id === selectedThemeId) || activeTheme;

  // Update local state when selected theme changes
  useState(() => {
    if (selectedTheme) {
      setColors(selectedTheme.colors as ThemeColors);
      setSectionStyles(selectedTheme.section_styles as SectionStyles);
      setThemeName(selectedTheme.name);
      if (!selectedThemeId) {
        setSelectedThemeId(selectedTheme.id);
      }
    }
  });

  const updateThemeMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTheme?.id) throw new Error("No theme selected");

      const { error } = await supabase
        .from("themes")
        .update({
          name: themeName,
          colors: colors as any,
          section_styles: sectionStyles as any,
        })
        .eq("id", selectedTheme.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-themes"] });
      toast.success("Theme updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update theme: " + error.message);
    },
  });

  const activateThemeMutation = useMutation({
    mutationFn: async (themeId: string) => {
      // Deactivate all themes
      const { error: deactivateError } = await supabase
        .from("themes")
        .update({ is_active: false })
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (deactivateError) throw deactivateError;

      // Activate selected theme
      const { error: activateError } = await supabase
        .from("themes")
        .update({ is_active: true })
        .eq("id", themeId);

      if (activateError) throw activateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-themes"] });
      toast.success("Theme activated successfully");
    },
    onError: (error) => {
      toast.error("Failed to activate theme: " + error.message);
    },
  });

  const deleteThemeMutation = useMutation({
    mutationFn: async (themeId: string) => {
      const { error } = await supabase
        .from("themes")
        .delete()
        .eq("id", themeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-themes"] });
      setSelectedThemeId(null);
      toast.success("Theme deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete theme: " + error.message);
    },
  });

  const createThemeMutation = useMutation({
    mutationFn: async (name: string) => {
      // Create new theme (not active by default)
      const { error } = await supabase
        .from("themes")
        .insert({
          name: name,
          is_active: false,
          colors: defaultColors as any,
          section_styles: {} as any,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-themes"] });
      setShowNewThemeDialog(false);
      setNewThemeName("");
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
    setShowNewThemeDialog(true);
  };

  const handleConfirmNewTheme = () => {
    if (!newThemeName.trim()) {
      toast.error("Please enter a theme name");
      return;
    }
    createThemeMutation.mutate(newThemeName);
  };

  const handleResetToDefault = () => {
    setColors(defaultColors);
    setSectionStyles({});
    setThemeName("Default Theme");
    toast.success("Theme reset to default values");
  };

  if (loadingThemes) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
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

      {/* Theme List */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Themes</CardTitle>
          <CardDescription>Select a theme to edit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {allThemes?.map((theme) => (
              <div
                key={theme.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedTheme?.id === theme.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => {
                  setSelectedThemeId(theme.id);
                  setColors(theme.colors as ThemeColors);
                  setSectionStyles(theme.section_styles as SectionStyles);
                  setThemeName(theme.name);
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">{theme.name}</span>
                  {theme.is_active && (
                    <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                      Active
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {!theme.is_active && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        activateThemeMutation.mutate(theme.id);
                      }}
                      disabled={activateThemeMutation.isPending}
                    >
                      Activate
                    </Button>
                  )}
                  {!theme.is_active && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete "${theme.name}"?`)) {
                          deleteThemeMutation.mutate(theme.id);
                        }
                      }}
                      disabled={deleteThemeMutation.isPending}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Theme Configuration */}
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="colors">
            <Palette className="h-4 w-4 mr-2" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="sections">
            <Layout className="h-4 w-4 mr-2" />
            Sections
          </TabsTrigger>
          <TabsTrigger value="pages">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Pages
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
            <SectionStyleEditor
              title="Footer Section"
              value={sectionStyles.footer || {}}
              onChange={(val) => setSectionStyles({ ...sectionStyles, footer: val })}
            />
          </div>
        </TabsContent>

        <TabsContent value="pages">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Default Page Title Section</CardTitle>
                <CardDescription>
                  Default styling for page title sections across all pages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SectionStyleEditor
                  title="Default Page Title"
                  value={sectionStyles.pageTitle || {}}
                  onChange={(val) => setSectionStyles({ ...sectionStyles, pageTitle: val })}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Blogs Page</CardTitle>
                <CardDescription>
                  Customize the title section for the blogs page
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SectionStyleEditor
                  title="Blogs Page Title"
                  value={sectionStyles.blogsPage || {}}
                  onChange={(val) => setSectionStyles({ ...sectionStyles, blogsPage: val })}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Events Page</CardTitle>
                <CardDescription>
                  Customize the title section for the events/calendar page
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SectionStyleEditor
                  title="Events Page Title"
                  value={sectionStyles.eventsPage || {}}
                  onChange={(val) => setSectionStyles({ ...sectionStyles, eventsPage: val })}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gallery Page</CardTitle>
                <CardDescription>
                  Customize the title section for the gallery page
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SectionStyleEditor
                  title="Gallery Page Title"
                  value={sectionStyles.galleryPage || {}}
                  onChange={(val) => setSectionStyles({ ...sectionStyles, galleryPage: val })}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Policies Page</CardTitle>
                <CardDescription>
                  Customize the title section for the policies page
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SectionStyleEditor
                  title="Policies Page Title"
                  value={sectionStyles.policiesPage || {}}
                  onChange={(val) => setSectionStyles({ ...sectionStyles, policiesPage: val })}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Calendar Page</CardTitle>
                <CardDescription>
                  Customize the title section for the school calendar page
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SectionStyleEditor
                  title="Calendar Page Title"
                  value={sectionStyles.calendarPage || {}}
                  onChange={(val) => setSectionStyles({ ...sectionStyles, calendarPage: val })}
                />
              </CardContent>
            </Card>
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

      {/* New Theme Dialog */}
      <Dialog open={showNewThemeDialog} onOpenChange={setShowNewThemeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Theme</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newThemeName">Theme Name</Label>
              <Input
                id="newThemeName"
                value={newThemeName}
                onChange={(e) => setNewThemeName(e.target.value)}
                placeholder="e.g., Summer Theme 2025"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleConfirmNewTheme();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowNewThemeDialog(false);
                setNewThemeName("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmNewTheme}
              disabled={createThemeMutation.isPending}
            >
              {createThemeMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Theme
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ThemeManagement;
