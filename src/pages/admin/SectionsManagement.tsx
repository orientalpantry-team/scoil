import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

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

  const handleSave = async (section: Section) => {
    setSaving(section.id);
    const { error } = await supabase
      .from("sections")
      .update({ content: section.content })
      .eq("id", section.id);

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
    }
    setSaving(null);
  };

  const updateContent = (id: string, newContent: string) => {
    try {
      const parsed = JSON.parse(newContent);
      setSections(sections.map(s => s.id === id ? { ...s, content: parsed } : s));
    } catch (e) {
      toast({
        title: "Invalid JSON",
        description: "Please enter valid JSON",
        variant: "destructive",
      });
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
            <CardContent className="space-y-4">
              <Textarea
                value={JSON.stringify(section.content, null, 2)}
                onChange={(e) => updateContent(section.id, e.target.value)}
                className="font-mono text-sm min-h-[200px]"
              />
              <Button
                onClick={() => handleSave(section)}
                disabled={saving === section.id}
              >
                {saving === section.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SectionsManagement;
