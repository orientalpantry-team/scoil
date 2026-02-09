import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";

const Enrollment = () => {
  const { data: enrollmentForms } = useQuery({
    queryKey: ["enrollment_forms"],
    queryFn: async () => {
      const { data } = await supabase
        .from("enrollment_forms")
        .select("*")
        .order("display_order", { ascending: true });
      return data || [];
    },
  });

  const { data: enrollmentStyles } = useQuery({
    queryKey: ["section", "home.enrollment"],
    queryFn: async () => {
      const { data } = await supabase
        .from("sections")
        .select("content")
        .eq("key", "home.enrollment")
        .single();
      return data?.content as { backgroundImage?: string; backgroundColor?: string; overlayOpacity?: number } | null;
    },
  });

  return (
    <div 
      className="min-h-screen py-16 bg-cover bg-center"
      style={{
        backgroundColor: enrollmentStyles?.backgroundColor 
          ? `hsl(${enrollmentStyles.backgroundColor})` 
          : undefined,
        backgroundImage: enrollmentStyles?.backgroundImage 
          ? `linear-gradient(hsla(${enrollmentStyles.backgroundColor || '0 0% 0%'}, ${enrollmentStyles.overlayOpacity ?? 0.5}), hsla(${enrollmentStyles.backgroundColor || '0 0% 0%'}, ${enrollmentStyles.overlayOpacity ?? 0.5})), url(${enrollmentStyles.backgroundImage})`
          : undefined,
      }}
    >
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Enrollment
        </h1>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Download the enrollment forms below to begin the registration process for your child.
        </p>
        
        {enrollmentForms && enrollmentForms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {enrollmentForms.map((form: any) => (
              <Card key={form.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{form.title}</h3>
                      {form.description && (
                        <p className="text-sm text-muted-foreground mb-3">{form.description}</p>
                      )}
                      <Button asChild variant="outline" size="sm">
                        <a href={form.file_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            <p>No enrollment forms available at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Enrollment;
