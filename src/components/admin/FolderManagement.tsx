import { useState } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface GalleryFolder {
  id: string;
  name: string;
  external_use: boolean;
  enabled: boolean;
  created_at: string;
}

export const FolderManagement = () => {
  const [editingFolder, setEditingFolder] = useState<GalleryFolder | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: folders = [] } = useQuery({
    queryKey: ["gallery-folders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_folders")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as GalleryFolder[];
    },
  });

  const createFolderMutation = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase
        .from("gallery_folders")
        .insert([{ name: name.trim() }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery-folders"] });
      queryClient.invalidateQueries({ queryKey: ["gallery-folders-external"] });
      toast({
        title: "Success",
        description: "Folder created successfully",
      });
      setNewFolderName("");
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Error",
        description: "Folder name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    createFolderMutation.mutate(newFolderName);
  };

  const updateFolderMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<GalleryFolder> }) => {
      const { error } = await supabase
        .from("gallery_folders")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery-folders"] });
      queryClient.invalidateQueries({ queryKey: ["gallery-folders-external"] });
      toast({
        title: "Success",
        description: "Folder updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpdateFolder = (folder: GalleryFolder, updates: Partial<GalleryFolder>) => {
    updateFolderMutation.mutate({ id: folder.id, updates });
  };

  const deleteFolderMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("gallery_folders")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery-folders"] });
      queryClient.invalidateQueries({ queryKey: ["gallery-folders-external"] });
      toast({
        title: "Success",
        description: "Folder deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteFolder = (folder: GalleryFolder) => {
    if (!confirm(`Are you sure you want to delete the folder "${folder.name}"? Images in this folder will not be deleted.`)) {
      return;
    }
    deleteFolderMutation.mutate(folder.id);
  };

  const renameFolderMutation = useMutation({
    mutationFn: async ({ folderId, oldName, newName }: { folderId: string; oldName: string; newName: string }) => {
      // Update folder name in gallery_folders table
      const { error: folderError } = await supabase
        .from("gallery_folders")
        .update({ name: newName.trim() })
        .eq("id", folderId);

      if (folderError) throw folderError;

      // Update all gallery items with this folder name
      const { error: galleryError } = await supabase
        .from("gallery")
        .update({ folder: newName.trim() })
        .eq("folder", oldName);

      if (galleryError) throw new Error("Folder renamed but some gallery items may not be updated");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery-folders"] });
      queryClient.invalidateQueries({ queryKey: ["gallery-folders-external"] });
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
      toast({
        title: "Success",
        description: "Folder renamed successfully",
      });
      setEditingFolder(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRenameFolder = (folder: GalleryFolder, newName: string) => {
    if (!newName.trim()) {
      toast({
        title: "Error",
        description: "Folder name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    renameFolderMutation.mutate({ folderId: folder.id, oldName: folder.name, newName });
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
        <ScrollArea className="h-[400px] pr-4">
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
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
