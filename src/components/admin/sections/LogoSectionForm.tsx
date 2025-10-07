import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ImageSelector } from "../ImageSelector";

const logoSchema = z.object({
  image: z.string().url("Must be a valid URL"),
  hoverText: z.string().min(1, "Hover text is required").max(100, "Hover text must be less than 100 characters"),
});

const logosSchema = z.object({
  logos: z.array(logoSchema).min(1, "At least one logo is required"),
});

type LogosFormData = z.infer<typeof logosSchema>;

interface LogoSectionFormProps {
  content: any;
  onSave: (content: any) => void;
  isSaving: boolean;
}

export const LogoSectionForm = ({ content, onSave, isSaving }: LogoSectionFormProps) => {
  const { toast } = useToast();
  const [selectingImageFor, setSelectingImageFor] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<LogosFormData>({
    resolver: zodResolver(logosSchema),
    defaultValues: content,
  });

  const logos = watch("logos") || [];

  const addLogo = () => {
    setValue("logos", [...logos, { image: "", hoverText: "" }]);
  };

  const removeLogo = (index: number) => {
    setValue(
      "logos",
      logos.filter((_, i) => i !== index)
    );
  };

  const handleImageSelect = (imageUrl: string) => {
    if (selectingImageFor !== null) {
      setValue(`logos.${selectingImageFor}.image`, imageUrl);
      setSelectingImageFor(null);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-6">
      <div className="space-y-4">
        {logos.map((logo, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4 bg-muted/50">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Logo {index + 1}</h4>
              {logos.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeLogo(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label>Logo Image</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectingImageFor(index)}
                  className="flex-1"
                >
                  Select from Gallery
                </Button>
              </div>
              {logo.image && (
                <img
                  src={logo.image}
                  alt="Preview"
                  className="w-32 h-32 object-contain rounded-md border bg-white"
                />
              )}
              <Input
                {...register(`logos.${index}.image`)}
                placeholder="Or paste image URL"
                className="mt-2"
              />
              {errors.logos?.[index]?.image && (
                <p className="text-sm text-destructive">
                  {errors.logos[index]?.image?.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`logos.${index}.hoverText`}>Hover Text</Label>
              <Input
                {...register(`logos.${index}.hoverText`)}
                placeholder="Text to show on hover"
              />
              {errors.logos?.[index]?.hoverText && (
                <p className="text-sm text-destructive">
                  {errors.logos[index]?.hoverText?.message}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" onClick={addLogo} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Logo
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
