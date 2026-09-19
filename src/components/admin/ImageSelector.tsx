import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, ImagePlus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { isImageFile, toWebImage } from "@/lib/imageUpload";

interface GalleryImage {
  id: string;
  image_url: string;
  title: string | null;
}

interface ImageSelectorProps {
  onSelect: (imageUrl: string) => void;
  onClose: () => void;
}

export const ImageSelector = ({ onSelect, onClose }: ImageSelectorProps) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
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
      setImages(data || []);
    }
    setLoading(false);
  };

  const handleUpload = async (file: File) => {
    if (!isImageFile(file)) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const imageFile = await toWebImage(file);
      const fileExt = imageFile.name.split(".").pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("gallery")
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from("gallery")
        .insert({ image_url: publicUrl, title: file.name });

      if (insertError) throw insertError;

      toast({ title: "Success", description: "Image uploaded successfully" });
      fetchImages();
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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const openFileDialog = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleUpload(file);
    };
    input.click();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select or Upload Image</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
            } ${uploading ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}
            onClick={openFileDialog}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <ImagePlus className="h-12 w-12 text-muted-foreground" />
                <div>
                  <p className="font-medium">Upload New Image</p>
                  <p className="text-sm text-muted-foreground">
                    Click to browse or drag and drop an image here
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Gallery Section */}
          <div>
            <h3 className="font-medium mb-3">Or select from gallery</h3>
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No images in gallery yet</p>
                <p className="text-sm">Upload your first image above</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="grid grid-cols-3 gap-4 p-1">
                  {images.map((image) => (
                    <button
                      key={image.id}
                      onClick={() => {
                        onSelect(image.image_url);
                        onClose();
                      }}
                      className="relative aspect-square overflow-hidden rounded-lg border-2 border-transparent hover:border-primary transition-colors group"
                    >
                      <img
                        src={image.image_url}
                        alt={image.title || "Gallery image"}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm font-medium">Select</span>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
