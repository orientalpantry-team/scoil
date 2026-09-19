import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Upload, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ImageSelector } from "../ImageSelector";
import { toWebImage } from "@/lib/imageUpload";

const slideSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  subtitle: z.string().min(1, "Subtitle is required").max(200, "Subtitle must be less than 200 characters"),
  image: z.string().url("Must be a valid URL"),
});

const heroSchema = z.object({
  slides: z.array(slideSchema).min(1, "At least one slide is required"),
});

type HeroFormData = z.infer<typeof heroSchema>;

interface HeroSectionFormProps {
  content: any;
  onSave: (content: any) => void;
  isSaving: boolean;
}

export const HeroSectionForm = ({ content, onSave, isSaving }: HeroSectionFormProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState<number | null>(null);
  const [selectingImageFor, setSelectingImageFor] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<HeroFormData>({
    resolver: zodResolver(heroSchema),
    defaultValues: content,
  });

  const slides = watch("slides") || [];

  const handleImageUpload = async (slideIndex: number, file: File) => {
    setUploading(slideIndex);
    try {
      const imageFile = await toWebImage(file);
      const fileExt = imageFile.name.split(".").pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("uploads")
        .getPublicUrl(filePath);

      setValue(`slides.${slideIndex}.image`, publicUrl);
      toast({ title: "Success", description: "Image uploaded successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(null);
    }
  };

  const addSlide = () => {
    setValue("slides", [...slides, { title: "", subtitle: "", image: "" }]);
  };

  const removeSlide = (index: number) => {
    setValue(
      "slides",
      slides.filter((_, i) => i !== index)
    );
  };

  const handleImageSelect = (imageUrl: string) => {
    if (selectingImageFor !== null) {
      setValue(`slides.${selectingImageFor}.image`, imageUrl);
      setSelectingImageFor(null);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-6">
      <div className="space-y-4">
        {slides.map((slide, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4 bg-muted/50">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Slide {index + 1}</h4>
              {slides.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeSlide(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`slides.${index}.title`}>Title</Label>
              <Input
                {...register(`slides.${index}.title`)}
                placeholder="Enter slide title"
              />
              {errors.slides?.[index]?.title && (
                <p className="text-sm text-destructive">
                  {errors.slides[index]?.title?.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`slides.${index}.subtitle`}>Subtitle</Label>
              <Input
                {...register(`slides.${index}.subtitle`)}
                placeholder="Enter slide subtitle"
              />
              {errors.slides?.[index]?.subtitle && (
                <p className="text-sm text-destructive">
                  {errors.slides[index]?.subtitle?.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Background Image</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectingImageFor(index)}
                  className="flex-1"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Select from Gallery
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading === index}
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) handleImageUpload(index, file);
                    };
                    input.click();
                  }}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              {slide.image && (
                <img
                  src={slide.image}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-md"
                />
              )}
              {errors.slides?.[index]?.image && (
                <p className="text-sm text-destructive">
                  {errors.slides[index]?.image?.message}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" onClick={addSlide} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Slide
      </Button>

      <Button type="submit" disabled={isSaving} className="w-full">
        {isSaving ? "Saving..." : "Save Changes"}
      </Button>

      {selectingImageFor !== null && (
        <ImageSelector
          onSelect={handleImageSelect}
          onClose={() => setSelectingImageFor(null)}
        />
      )}
    </form>
  );
};
