import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ImageSelector } from "../ImageSelector";

const logoSchema = z.object({
  image: z.string().url("Must be a valid URL"),
  hoverText: z.string().min(1, "Hover text is required").max(100, "Hover text must be less than 100 characters"),
});

type LogoFormData = z.infer<typeof logoSchema>;

interface LogoSectionFormProps {
  content: any;
  onSave: (content: any) => void;
  isSaving: boolean;
}

export const LogoSectionForm = ({ content, onSave, isSaving }: LogoSectionFormProps) => {
  const { toast } = useToast();
  const [selectingImage, setSelectingImage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<LogoFormData>({
    resolver: zodResolver(logoSchema),
    defaultValues: content,
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${Math.random()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('gallery')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath);

      setValue('image', publicUrl);
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    setValue('image', imageUrl);
    setSelectingImage(false);
  };

  const logo = watch();

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-6">
      <div className="p-4 border rounded-lg space-y-4 bg-muted/50">
        <h4 className="font-semibold">School Logo</h4>

        <div className="space-y-2">
          <Label>Logo Image</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectingImage(true)}
              className="flex-1"
            >
              Select from Gallery
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isUploading}
              onClick={() => document.getElementById('logo-upload')?.click()}
              className="flex-1"
            >
              {isUploading ? "Uploading..." : "Upload Image"}
            </Button>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          {logo.image && (
            <img
              src={logo.image}
              alt="Preview"
              className="w-32 h-32 object-contain rounded-md border bg-white"
            />
          )}
          {errors.image && (
            <p className="text-sm text-destructive">
              {errors.image.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="hoverText">Hover Text</Label>
          <Input
            {...register('hoverText')}
            placeholder="Text to show on hover"
          />
          {errors.hoverText && (
            <p className="text-sm text-destructive">
              {errors.hoverText.message}
            </p>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isSaving} className="w-full">
        {isSaving ? "Saving..." : "Save Changes"}
      </Button>

      {selectingImage && (
        <ImageSelector
          onSelect={handleImageSelect}
          onClose={() => setSelectingImage(false)}
        />
      )}
    </form>
  );
};
