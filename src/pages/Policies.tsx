import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download } from "lucide-react";
import PageTitle from "@/components/layout/PageTitle";

const Policies = () => {
  const { data: policies, isLoading } = useQuery({
    queryKey: ["policies"],
    queryFn: async () => {
      const { data } = await supabase
        .from("policies")
        .select("*")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  return (
    <div className="min-h-screen">
      <PageTitle 
        title="School Policies" 
        description="Important policies and guidelines"
        pageKey="policiesPage"
      />
      <div className="container mx-auto px-4 pb-16">

        {isLoading ? (
          <div className="max-w-4xl mx-auto space-y-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : policies && policies.length > 0 ? (
          <div className="max-w-4xl mx-auto space-y-4">
            {policies.map((policy) => (
              <Card key={policy.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-primary" />
                    {policy.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {policy.description && (
                    <p className="text-muted-foreground mb-4">{policy.description}</p>
                  )}
                  {policy.file_url && (
                    <Button asChild variant="outline">
                      <a href={policy.file_url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No policies available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Policies;
