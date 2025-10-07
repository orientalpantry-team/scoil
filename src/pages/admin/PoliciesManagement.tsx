import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2, Upload, ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Policy {
  id: string;
  title: string;
  description: string;
  file_url: string | null;
}

const PoliciesManagement = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    const { data, error } = await supabase
      .from("policies")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setPolicies(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, fileUrl: string | null) => {
    if (!confirm("Are you sure you want to delete this policy?")) return;

    try {
      // Delete file from storage if it exists and is in our bucket
      if (fileUrl && fileUrl.includes("/policies/")) {
        const urlParts = fileUrl.split("/policies/");
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          await supabase.storage.from("policies").remove([filePath]);
        }
      }

      // Delete from database
      const { error } = await supabase.from("policies").delete().eq("id", id);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Policy deleted successfully",
      });
      fetchPolicies();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    
    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File | null;
    const fileUrl = formData.get("file_url") as string;
    
    let uploadedFileUrl = fileUrl || editingPolicy?.file_url || null;

    try {
      // Handle file upload if a file is selected
      if (file && file.size > 0) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("policies")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from("policies")
          .getPublicUrl(fileName);

        uploadedFileUrl = publicUrl;

        // Delete old file if updating and old file was in storage
        if (editingPolicy?.file_url && editingPolicy.file_url.includes("/policies/")) {
          const urlParts = editingPolicy.file_url.split("/policies/");
          if (urlParts.length > 1) {
            const oldFilePath = urlParts[1];
            await supabase.storage.from("policies").remove([oldFilePath]);
          }
        }
      }

      const policyData = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        file_url: uploadedFileUrl,
      };

      let error;
      if (editingPolicy) {
        ({ error } = await supabase
          .from("policies")
          .update(policyData)
          .eq("id", editingPolicy.id));
      } else {
        ({ error } = await supabase.from("policies").insert([policyData]));
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Policy ${editingPolicy ? "updated" : "created"} successfully`,
      });
      setOpen(false);
      setEditingPolicy(null);
      fetchPolicies();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Policies Management</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingPolicy(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Policy
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPolicy ? "Edit Policy" : "Add New Policy"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editingPolicy?.title}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingPolicy?.description}
                  rows={4}
                />
              </div>
              
              <Tabs defaultValue="upload">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload File
                  </TabsTrigger>
                  <TabsTrigger value="url">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    File URL
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload" className="space-y-2">
                  <Label htmlFor="file">Upload PDF Document</Label>
                  <Input
                    id="file"
                    name="file"
                    type="file"
                    accept=".pdf,.doc,.docx"
                  />
                  {editingPolicy?.file_url && (
                    <p className="text-xs text-muted-foreground">
                      Current file: <a href={editingPolicy.file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View</a>
                    </p>
                  )}
                </TabsContent>
                
                <TabsContent value="url" className="space-y-2">
                  <Label htmlFor="file_url">File URL</Label>
                  <Input
                    id="file_url"
                    name="file_url"
                    type="url"
                    defaultValue={editingPolicy?.file_url || ""}
                    placeholder="https://example.com/policy.pdf"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a direct link to the policy document
                  </p>
                </TabsContent>
              </Tabs>

              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingPolicy ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>{editingPolicy ? "Update" : "Create"} Policy</>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {policies.map((policy) => (
          <Card key={policy.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{policy.title}</CardTitle>
                  {policy.file_url && (
                    <a
                      href={policy.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline mt-1 inline-block"
                    >
                      View Document
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setEditingPolicy(policy);
                      setOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(policy.id, policy.file_url)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{policy.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PoliciesManagement;
