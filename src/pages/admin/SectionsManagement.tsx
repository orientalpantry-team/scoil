import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { HeroSectionForm } from "@/components/admin/sections/HeroSectionForm";
import { AboutSectionForm } from "@/components/admin/sections/AboutSectionForm";
import { ContactSectionForm } from "@/components/admin/sections/ContactSectionForm";
import { LogoSectionForm } from "@/components/admin/sections/LogoSectionForm";

interface Section {
  id: string;
  key: string;
  content: any;
}

const SectionsManagement = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    const { data, error } = await supabase
      .from("sections")
      .select("*")
      .order("key");

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setSections(data || []);
    }
    setLoading(false);
  };

  const handleSave = async (sectionId: string, content: any) => {
    setSaving(sectionId);
    const { error } = await supabase
      .from("sections")
      .update({ content })
      .eq("id", sectionId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Section updated successfully",
      });
      fetchSections();
    }
    setSaving(null);
  };

  const renderForm = (section: Section) => {
    const isSaving = saving === section.id;

    switch (section.key) {
      case "home.hero":
        return (
          <HeroSectionForm
            content={section.content}
            onSave={(content) => handleSave(section.id, content)}
            isSaving={isSaving}
          />
        );
      case "home.about":
        return (
          <AboutSectionForm
            content={section.content}
            onSave={(content) => handleSave(section.id, content)}
            isSaving={isSaving}
          />
        );
      case "home.contact":
        return (
          <ContactSectionForm
            content={section.content}
            onSave={(content) => handleSave(section.id, content)}
            isSaving={isSaving}
          />
        );
      case "home.logos":
        return (
          <LogoSectionForm
            content={section.content}
            onSave={(content) => handleSave(section.id, content)}
            isSaving={isSaving}
          />
        );
      default:
        return (
          <p className="text-muted-foreground">
            No form available for this section type
          </p>
        );
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Sections Management</h1>
      <div className="space-y-6">
        {sections.map((section) => (
          <Card key={section.id}>
            <CardHeader>
              <CardTitle className="text-lg">{section.key}</CardTitle>
            </CardHeader>
            <CardContent>
              {renderForm(section)}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SectionsManagement;
