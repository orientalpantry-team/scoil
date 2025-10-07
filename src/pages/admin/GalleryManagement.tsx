import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Loader2, FolderOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GalleryItem {
  id: string;
  title: string | null;
  image_url: string;
  folder: string;
}

const GalleryManagement = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [newFolder, setNewFolder] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  const folders = ["all", ...Array.from(new Set(items.map((item) => item.folder || "general")))];

  const filteredItems = selectedFolder === "all" 
    ? items 
    : items.filter((item) => item.folder === selectedFolder);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData(e.currentTarget);
    const files = formData.getAll("images") as File[];
    const folder = (formData.get("folder") as string) || newFolder || "general";
    const title = formData.get("title") as string;

    if (files.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one image",
        variant: "destructive",
      });
      setUploading(false);
      return;
    }

    try {
      const uploadPromises = files.map(async (file, index) => {
        // Upload to storage
        const fileExt = file.name.split(".").pop();
        const fileName = `${folder}/${Date.now()}-${index}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("gallery")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from("gallery")
          .getPublicUrl(fileName);

        // Insert into database
        const itemTitle = files.length === 1 ? title : (title ? `${title} ${index + 1}` : null);
        
        return supabase
          .from("gallery")
          .insert([{ 
            title: itemTitle || null, 
            image_url: publicUrl,
            folder: folder
          }]);
      });

      await Promise.all(uploadPromises);

      toast({
        title: "Success",
        description: `${files.length} image(s) uploaded successfully`,
      });
      setOpen(false);
      setNewFolder("");
      fetchGallery();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    
    setUploading(false);
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      // Extract file path from URL
      const urlParts = imageUrl.split("/gallery/");
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        // Delete from storage
        await supabase.storage.from("gallery").remove([filePath]);
      }

      // Delete from database
      const { error } = await supabase.from("gallery").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
      fetchGallery();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
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
        <div>
          <h1 className="text-3xl font-bold">Gallery Management</h1>
          <p className="text-muted-foreground mt-1">
            {filteredItems.length} image{filteredItems.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Upload Images
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Images</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <Label htmlFor="images">Select Images (Multiple)</Label>
                <Input
                  id="images"
                  name="images"
                  type="file"
                  accept="image/*"
                  multiple
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  You can select multiple images at once
                </p>
              </div>
              <div>
                <Label htmlFor="folder">Folder</Label>
                <Select name="folder">
                  <SelectTrigger>
                    <SelectValue placeholder="Select or create folder" />
                  </SelectTrigger>
                  <SelectContent>
                    {folders.filter(f => f !== "all").map((folder) => (
                      <SelectItem key={folder} value={folder}>
                        {folder}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="newFolder">Or Create New Folder</Label>
                <Input
                  id="newFolder"
                  value={newFolder}
                  onChange={(e) => setNewFolder(e.target.value)}
                  placeholder="e.g., events, sports, academics"
                />
              </div>
              <div>
                <Label htmlFor="title">Base Title (Optional)</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Image title"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  For multiple images, numbers will be appended
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload Images"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Folder filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {folders.map((folder) => (
          <Button
            key={folder}
            variant={selectedFolder === folder ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFolder(folder)}
          >
            <FolderOpen className="mr-2 h-4 w-4" />
            {folder}
            {folder !== "all" && (
              <Badge variant="secondary" className="ml-2">
                {items.filter((item) => item.folder === folder).length}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative group">
                <img
                  src={item.image_url}
                  alt={item.title || "Gallery image"}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(item.id, item.image_url)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  {item.title && <p className="font-medium">{item.title}</p>}
                  <Badge variant="secondary" className="text-xs">
                    {item.folder}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GalleryManagement;
