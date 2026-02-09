import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Image as ImageIcon, X } from "lucide-react";
import { ImageSelector } from "./ImageSelector";
import { ColorPicker } from "./ColorPicker";
import { Slider } from "@/components/ui/slider";
import type { Json } from "@/integrations/supabase/types";

interface EnrollmentSectionStyles {
  backgroundImage?: string;
  backgroundColor?: string;
  overlayOpacity?: number;
}

export const EnrollmentSectionSettings = () => {
  const [settings, setSettings] = useState<EnrollmentSectionStyles>({
    backgroundColor: "215 70% 35%",
    overlayOpacity: 0.5,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from("sections")
      .select("content")
      .eq("key", "home.enrollment")
      .single();

    if (data?.content && typeof data.content === 'object') {
      setSettings(data.content as EnrollmentSectionStyles);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    
    // Check if the record exists
    const { data: existing } = await supabase
      .from("sections")
      .select("id")
      .eq("key", "home.enrollment")
      .single();

    const contentToSave: Json = {
      backgroundImage: settings.backgroundImage,
      backgroundColor: settings.backgroundColor,
      overlayOpacity: settings.overlayOpacity,
    };
    
    let error;
    if (existing) {
      ({ error } = await supabase
        .from("sections")
        .update({ content: contentToSave, updated_at: new Date().toISOString() })
        .eq("key", "home.enrollment"));
    } else {
      ({ error } = await supabase
        .from("sections")
        .insert([{ key: "home.enrollment", content: contentToSave }]));
    }

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Section settings saved successfully",
      });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <Card className="mb-8">
        <CardContent className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Section Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Background Image */}
          <div className="space-y-2">
            <Label>Background Image</Label>
            {settings.backgroundImage ? (
              <div className="relative inline-block">
                <img
                  src={settings.backgroundImage}
                  alt="Background preview"
                  className="w-48 h-32 object-cover rounded-lg border"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6"
                  onClick={() => setSettings({ ...settings, backgroundImage: undefined })}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowImageSelector(true)}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Select Background Image
              </Button>
            )}
            {settings.backgroundImage && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowImageSelector(true)}
                className="ml-2"
              >
                Change Image
              </Button>
            )}
          </div>

          {/* Background Color */}
          <ColorPicker
            label="Background Color"
            value={settings.backgroundColor || "215 70% 35%"}
            onChange={(value) => setSettings({ ...settings, backgroundColor: value })}
            description="Used when no background image is set, or as an overlay tint"
          />

          {/* Overlay Opacity - only show when image is set */}
          {settings.backgroundImage && (
            <div className="space-y-2">
              <Label>Overlay Opacity: {Math.round((settings.overlayOpacity || 0.5) * 100)}%</Label>
              <p className="text-sm text-muted-foreground">
                Controls how much of the background color overlays the image
              </p>
              <Slider
                value={[settings.overlayOpacity ?? 0.5]}
                onValueChange={(value) => setSettings({ ...settings, overlayOpacity: value[0] })}
                min={0}
                max={1}
                step={0.1}
                className="w-full max-w-md"
              />
            </div>
          )}

          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </CardContent>
      </Card>

      {showImageSelector && (
        <ImageSelector
          onSelect={(imageUrl) => {
            setSettings({ ...settings, backgroundImage: imageUrl });
            setShowImageSelector(false);
          }}
          onClose={() => setShowImageSelector(false)}
        />
      )}
    </>
  );
};
