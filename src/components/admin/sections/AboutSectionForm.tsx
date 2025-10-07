import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const aboutSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  content: z.string().min(1, "Content is required").max(2000, "Content must be less than 2000 characters"),
});

type AboutFormData = z.infer<typeof aboutSchema>;

interface AboutSectionFormProps {
  content: any;
  onSave: (content: any) => void;
  isSaving: boolean;
}

export const AboutSectionForm = ({ content, onSave, isSaving }: AboutSectionFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<AboutFormData>({
    resolver: zodResolver(aboutSchema),
    defaultValues: content,
  });

  const contentValue = watch("content") || "";

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Section Title</Label>
        <Input
          {...register("title")}
          placeholder="e.g., About Our School"
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="content">Content</Label>
          <span className="text-sm text-muted-foreground">
            {contentValue.length} / 2000
          </span>
        </div>
        <Textarea
          {...register("content")}
          placeholder="Enter the about section content..."
          className="min-h-[300px]"
        />
        <p className="text-sm text-muted-foreground">
          You can use HTML formatting like &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, etc.
        </p>
        {errors.content && (
          <p className="text-sm text-destructive">{errors.content.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSaving} className="w-full">
        {isSaving ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
};
