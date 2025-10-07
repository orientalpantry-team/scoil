import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const featureSchema = z.object({
  icon: z.string().min(1, "Icon is required"),
  title: z.string().min(1, "Title is required").max(50, "Title must be less than 50 characters"),
  description: z.string().min(1, "Description is required").max(200, "Description must be less than 200 characters"),
});

const featuresSchema = z.object({
  title: z.string().min(1, "Section title is required").max(100, "Title must be less than 100 characters"),
  features: z.array(featureSchema).min(1, "At least one feature is required"),
});

type FeaturesFormData = z.infer<typeof featuresSchema>;

interface FeaturesSectionFormProps {
  content: any;
  onSave: (content: any) => void;
  isSaving: boolean;
}

const availableIcons = [
  "BookOpen",
  "Users",
  "Award",
  "Heart",
  "GraduationCap",
  "Star",
  "Target",
  "Zap",
  "Globe",
  "Calendar",
];

export const FeaturesSectionForm = ({ content, onSave, isSaving }: FeaturesSectionFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FeaturesFormData>({
    resolver: zodResolver(featuresSchema),
    defaultValues: content,
  });

  const features = watch("features") || [];

  const addFeature = () => {
    setValue("features", [...features, { icon: "BookOpen", title: "", description: "" }]);
  };

  const removeFeature = (index: number) => {
    setValue(
      "features",
      features.filter((_, i) => i !== index)
    );
  };

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Section Title</Label>
        <Input
          {...register("title")}
          placeholder="e.g., Why Choose Our School"
        />
        {errors.title && (
          <p className="text-sm text-destructive">
            {errors.title.message}
          </p>
        )}
      </div>

      <div className="space-y-4">
        {features.map((feature, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4 bg-muted/50">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Feature {index + 1}</h4>
              {features.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeFeature(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`features.${index}.icon`}>Icon</Label>
              <Select
                value={feature.icon}
                onValueChange={(value) => setValue(`features.${index}.icon`, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an icon" />
                </SelectTrigger>
                <SelectContent>
                  {availableIcons.map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      {icon}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.features?.[index]?.icon && (
                <p className="text-sm text-destructive">
                  {errors.features[index]?.icon?.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`features.${index}.title`}>Title</Label>
              <Input
                {...register(`features.${index}.title`)}
                placeholder="Feature title"
              />
              {errors.features?.[index]?.title && (
                <p className="text-sm text-destructive">
                  {errors.features[index]?.title?.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`features.${index}.description`}>Description</Label>
              <Textarea
                {...register(`features.${index}.description`)}
                placeholder="Feature description"
                rows={3}
              />
              {errors.features?.[index]?.description && (
                <p className="text-sm text-destructive">
                  {errors.features[index]?.description?.message}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" onClick={addFeature} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Feature
      </Button>

      <Button type="submit" disabled={isSaving} className="w-full">
        {isSaving ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
};
