import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { FolderOpen, Edit, Trash2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GalleryFolder {
  id: string;
  name: string;
  external_use: boolean;
  enabled: boolean;
  created_at: string;
}

export const FolderManagement = () => {
  const [folders, setFolders] = useState<GalleryFolder[]>([]);
  const [editingFolder, setEditingFolder] = useState<GalleryFolder | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchFolders();
  }, []);

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

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Error",
        description: "Folder name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("gallery_folders")
      .insert([{ name: newFolderName.trim() }]);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Folder created successfully",
      });
      setNewFolderName("");
      setIsDialogOpen(false);
      fetchFolders();
    }
  };

  const handleUpdateFolder = async (folder: GalleryFolder, updates: Partial<GalleryFolder>) => {
    const { error } = await supabase
      .from("gallery_folders")
      .update(updates)
      .eq("id", folder.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Folder updated successfully",
      });
      fetchFolders();
    }
  };

  const handleDeleteFolder = async (folder: GalleryFolder) => {
    if (!confirm(`Are you sure you want to delete the folder "${folder.name}"? Images in this folder will not be deleted.`)) {
      return;
    }

    const { error } = await supabase
      .from("gallery_folders")
      .delete()
      .eq("id", folder.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Folder deleted successfully",
      });
      fetchFolders();
    }
  };

  const handleRenameFolder = async (folder: GalleryFolder, newName: string) => {
    if (!newName.trim()) {
      toast({
        title: "Error",
        description: "Folder name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    // Update folder name in gallery_folders table
    const { error: folderError } = await supabase
      .from("gallery_folders")
      .update({ name: newName.trim() })
      .eq("id", folder.id);

    if (folderError) {
      toast({
        title: "Error",
        description: folderError.message,
        variant: "destructive",
      });
      return;
    }

    // Update all gallery items with this folder name
    const { error: galleryError } = await supabase
      .from("gallery")
      .update({ folder: newName.trim() })
      .eq("folder", folder.name);

    if (galleryError) {
      toast({
        title: "Warning",
        description: "Folder renamed but some gallery items may not be updated",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Folder renamed successfully",
      });
    }

    setEditingFolder(null);
    fetchFolders();
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Folder Management</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Folder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="newFolderName">Folder Name</Label>
                <Input
                  id="newFolderName"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g., events, sports, academics"
                />
              </div>
              <Button onClick={handleCreateFolder} className="w-full">
                Create Folder
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {folders.map((folder) => (
            <div key={folder.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                <FolderOpen className="h-5 w-5 text-muted-foreground" />
                {editingFolder?.id === folder.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={editingFolder.name}
                      onChange={(e) => setEditingFolder({ ...editingFolder, name: e.target.value })}
                      className="max-w-xs"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleRenameFolder(folder, editingFolder.name)}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingFolder(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="font-medium">{folder.name}</span>
                    {!folder.enabled && (
                      <Badge variant="secondary">Disabled</Badge>
                    )}
                    {folder.external_use && (
                      <Badge variant="outline">External Use</Badge>
                    )}
                  </>
                )}
              </div>
              
              {!editingFolder && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`external-${folder.id}`} className="text-sm cursor-pointer">
                      External Use
                    </Label>
                    <Switch
                      id={`external-${folder.id}`}
                      checked={folder.external_use}
                      onCheckedChange={(checked) => 
                        handleUpdateFolder(folder, { external_use: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`enabled-${folder.id}`} className="text-sm cursor-pointer">
                      Enabled
                    </Label>
                    <Switch
                      id={`enabled-${folder.id}`}
                      checked={folder.enabled}
                      onCheckedChange={(checked) => 
                        handleUpdateFolder(folder, { enabled: checked })
                      }
                    />
                  </div>
                  
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setEditingFolder(folder)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteFolder(folder)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
