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
import { Plus, Trash2, Loader2, FolderOpen, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface GalleryItem {
  id: string;
  title: string | null;
  image_url: string;
  folder: string;
}

interface GalleryFolder {
  id: string;
  name: string;
  external_use: boolean;
  enabled: boolean;
}

const GalleryManagement = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [folders, setFolders] = useState<GalleryFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editFolderOpen, setEditFolderOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [newFolder, setNewFolder] = useState("");
  const [editingFolder, setEditingFolder] = useState<GalleryFolder | null>(null);
  const [folderName, setFolderName] = useState("");
  const [folderExternalUse, setFolderExternalUse] = useState(false);
  const [folderEnabled, setFolderEnabled] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchGallery();
    fetchFolders();
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

  const fetchFolders = async () => {
    const { data, error } = await supabase
      .from("gallery_folders")
      .select("*")
      .order("name");

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setFolders(data || []);
    }
  };

  const imageFolders = Array.from(new Set(items.map((item) => item.folder || "general")));
  const allFolders = ["all", ...imageFolders];

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
      // Check if folder exists in gallery_folders, if not create it
      const { data: existingFolder } = await supabase
        .from("gallery_folders")
        .select("*")
        .eq("name", folder)
        .maybeSingle();

      if (!existingFolder) {
        const { error: folderError } = await supabase
          .from("gallery_folders")
          .insert({
            name: folder,
            external_use: false,
            enabled: true,
          });

        if (folderError) throw folderError;
      }

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
      fetchFolders();
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

  const openEditFolder = (folderName: string) => {
    const folder = folders.find(f => f.name === folderName);
    if (folder) {
      setEditingFolder(folder);
      setFolderName(folder.name);
      setFolderExternalUse(folder.external_use);
      setFolderEnabled(folder.enabled);
      setEditFolderOpen(true);
    }
  };

  const handleSaveFolder = async () => {
    if (!editingFolder) return;

    try {
      const { error } = await supabase
        .from("gallery_folders")
        .update({
          name: folderName,
          external_use: folderExternalUse,
          enabled: folderEnabled,
        })
        .eq("id", editingFolder.id);

      if (error) throw error;

      // Update folder name in gallery items if name changed
      if (folderName !== editingFolder.name) {
        await supabase
          .from("gallery")
          .update({ folder: folderName })
          .eq("folder", editingFolder.name);
      }

      toast({
        title: "Success",
        description: "Folder updated successfully",
      });
      setEditFolderOpen(false);
      fetchFolders();
      fetchGallery();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteFolder = async () => {
    if (!editingFolder) return;
    if (!confirm("Are you sure you want to delete this folder? Images in this folder will remain but will need to be reassigned.")) return;

    try {
      const { error } = await supabase
        .from("gallery_folders")
        .delete()
        .eq("id", editingFolder.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Folder deleted successfully",
      });
      setEditFolderOpen(false);
      fetchFolders();
      if (selectedFolder === editingFolder.name) {
        setSelectedFolder("all");
      }
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
                    {imageFolders.map((folder) => (
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
        {allFolders.map((folder) => {
          const folderData = folders.find(f => f.name === folder);
          return (
            <div key={folder} className="flex items-center gap-1">
              <Button
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
              {folder !== "all" && folderData && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => openEditFolder(folder)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Folder Dialog */}
      <Dialog open={editFolderOpen} onOpenChange={setEditFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="folderName">Folder Name</Label>
              <Input
                id="folderName"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="externalUse">External Use</Label>
              <Switch
                id="externalUse"
                checked={folderExternalUse}
                onCheckedChange={setFolderExternalUse}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="enabled">Enabled</Label>
              <Switch
                id="enabled"
                checked={folderEnabled}
                onCheckedChange={setFolderEnabled}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={handleDeleteFolder}
                className="flex-1"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
              <Button
                onClick={handleSaveFolder}
                className="flex-1"
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
