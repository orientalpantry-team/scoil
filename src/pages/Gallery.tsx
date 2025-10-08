import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FolderOpen, X } from "lucide-react";

const Gallery = () => {
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string | null } | null>(null);

  const { data: images, isLoading } = useQuery({
    queryKey: ["gallery"],
    queryFn: async () => {
      const { data } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: externalFolders } = useQuery({
    queryKey: ["gallery-folders-external"],
    queryFn: async () => {
      const { data } = await supabase
        .from("gallery_folders")
        .select("name")
        .eq("external_use", true)
        .eq("enabled", true);
      return data?.map(f => f.name) || [];
    },
  });

  const folders = ["all", ...Array.from(new Set(
    images
      ?.map((img) => img.folder || "general")
      .filter(folder => externalFolders?.includes(folder)) || []
  ))];
  
  const filteredImages = selectedFolder === "all" 
    ? images 
    : images?.filter((img) => img.folder === selectedFolder);

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
          Gallery
        </h1>
        <p className="text-center text-muted-foreground mb-12 text-lg">
          Moments captured from our school activities and events
        </p>

        {/* Folder filter */}
        {!isLoading && images && images.length > 0 && (
          <div className="flex gap-2 mb-8 flex-wrap justify-center">
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
                    {images.filter((img) => img.folder === folder).length}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : filteredImages && filteredImages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((image) => (
              <Card 
                key={image.id} 
                className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedImage({ url: image.image_url, title: image.title })}
              >
                <CardContent className="p-0">
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={image.image_url}
                      alt={image.title || "Gallery image"}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      {image.title && <h3 className="font-semibold">{image.title}</h3>}
                      <Badge variant="secondary" className="text-xs">
                        {image.folder || "general"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {selectedFolder === "all" 
                ? "No images in gallery yet."
                : `No images in "${selectedFolder}" folder.`
              }
            </p>
          </div>
        )}

        {/* Image Lightbox */}
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-5xl w-full p-0 overflow-hidden">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute right-4 top-4 z-50 rounded-full bg-background/80 p-2 hover:bg-background transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            {selectedImage && (
              <div className="relative">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.title || "Gallery image"}
                  className="w-full h-auto max-h-[85vh] object-contain"
                />
                {selectedImage.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                    <h3 className="text-white text-xl font-semibold">{selectedImage.title}</h3>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Gallery;
