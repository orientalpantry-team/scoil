import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2, Upload, ExternalLink, GripVertical } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnrollmentSectionSettings } from "@/components/admin/EnrollmentSectionSettings";

interface EnrollmentForm {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  display_order: number;
}

const EnrollmentManagement = () => {
  const [forms, setForms] = useState<EnrollmentForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingForm, setEditingForm] = useState<EnrollmentForm | null>(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    const { data, error } = await supabase
      .from("enrollment_forms")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setForms(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, fileUrl: string) => {
    if (!confirm("Are you sure you want to delete this enrollment form?")) return;

    try {
      // Delete file from storage if it exists and is in our bucket
      if (fileUrl && fileUrl.includes("/enrollment/")) {
        const urlParts = fileUrl.split("/enrollment/");
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          await supabase.storage.from("enrollment").remove([filePath]);
        }
      }

      // Delete from database
      const { error } = await supabase.from("enrollment_forms").delete().eq("id", id);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Enrollment form deleted successfully",
      });
      fetchForms();
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
    
    let uploadedFileUrl = fileUrl || editingForm?.file_url || null;

    try {
      // Handle file upload if a file is selected
      if (file && file.size > 0) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("enrollment")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from("enrollment")
          .getPublicUrl(fileName);

        uploadedFileUrl = publicUrl;

        // Delete old file if updating and old file was in storage
        if (editingForm?.file_url && editingForm.file_url.includes("/enrollment/")) {
          const urlParts = editingForm.file_url.split("/enrollment/");
          if (urlParts.length > 1) {
            const oldFilePath = urlParts[1];
            await supabase.storage.from("enrollment").remove([oldFilePath]);
          }
        }
      }

      if (!uploadedFileUrl) {
        toast({
          title: "Error",
          description: "Please upload a file or provide a URL",
          variant: "destructive",
        });
        setUploading(false);
        return;
      }

      const enrollmentData = {
        title: formData.get("title") as string,
        description: formData.get("description") as string || null,
        file_url: uploadedFileUrl,
        display_order: editingForm?.display_order ?? forms.length,
      };

      let error;
      if (editingForm) {
        ({ error } = await supabase
          .from("enrollment_forms")
          .update(enrollmentData)
          .eq("id", editingForm.id));
      } else {
        ({ error } = await supabase.from("enrollment_forms").insert([enrollmentData]));
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Enrollment form ${editingForm ? "updated" : "created"} successfully`,
      });
      setOpen(false);
      setEditingForm(null);
      fetchForms();
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

  const moveForm = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= forms.length) return;

    const updatedForms = [...forms];
    const [movedForm] = updatedForms.splice(index, 1);
    updatedForms.splice(newIndex, 0, movedForm);

    // Update display_order for affected items
    const updates = updatedForms.map((form, i) => ({
      id: form.id,
      display_order: i,
    }));

    try {
      for (const update of updates) {
        await supabase
          .from("enrollment_forms")
          .update({ display_order: update.display_order })
          .eq("id", update.id);
      }
      setForms(updatedForms.map((f, i) => ({ ...f, display_order: i })));
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to reorder forms",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Enrollment Management</h1>
      </div>

      <EnrollmentSectionSettings />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Enrollment Forms</h2>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setEditingForm(null)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Form
          </Button>
        </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingForm ? "Edit Enrollment Form" : "Add New Enrollment Form"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editingForm?.title}
                  placeholder="e.g., Enrollment Application Form"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingForm?.description || ""}
                  placeholder="Brief description of this form"
                  rows={3}
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
                  <Label htmlFor="file">Upload Document</Label>
                  <Input
                    id="file"
                    name="file"
                    type="file"
                    accept=".pdf,.doc,.docx"
                  />
                  {editingForm?.file_url && (
                    <p className="text-xs text-muted-foreground">
                      Current file: <a href={editingForm.file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View</a>
                    </p>
                  )}
                </TabsContent>
                
                <TabsContent value="url" className="space-y-2">
                  <Label htmlFor="file_url">File URL</Label>
                  <Input
                    id="file_url"
                    name="file_url"
                    type="url"
                    defaultValue={editingForm?.file_url || ""}
                    placeholder="https://example.com/enrollment-form.pdf"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a direct link to the enrollment document
                  </p>
                </TabsContent>
              </Tabs>

              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingForm ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>{editingForm ? "Update" : "Create"} Form</>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {forms.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No enrollment forms yet. Add your first form to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {forms.map((form, index) => (
            <Card key={form.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveForm(index, "up")}
                        disabled={index === 0}
                      >
                        <GripVertical className="h-4 w-4 rotate-90" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveForm(index, "down")}
                        disabled={index === forms.length - 1}
                      >
                        <GripVertical className="h-4 w-4 rotate-90" />
                      </Button>
                    </div>
                    <div>
                      <CardTitle>{form.title}</CardTitle>
                      <a
                        href={form.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline mt-1 inline-block"
                      >
                        View Document
                      </a>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setEditingForm(form);
                        setOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(form.id, form.file_url)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {form.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{form.description}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnrollmentManagement;
