import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const contactSchema = z.object({
  phone: z.string().min(1, "Phone number is required").regex(/^[\d\s\-\+\(\)]+$/, "Invalid phone number format"),
  email: z.string().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  address: z.string().min(1, "Address is required").max(500, "Address must be less than 500 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactSectionFormProps {
  content: any;
  onSave: (content: any) => void;
  isSaving: boolean;
}

export const ContactSectionForm = ({ content, onSave, isSaving }: ContactSectionFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: content,
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          {...register("phone")}
          placeholder="e.g., +1 (555) 123-4567"
          type="tel"
        />
        <p className="text-sm text-muted-foreground">
          Include country code and area code
        </p>
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          {...register("email")}
          placeholder="e.g., info@school.edu"
          type="email"
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Physical Address</Label>
        <Textarea
          {...register("address")}
          placeholder="Enter the school's full address"
          className="min-h-[120px]"
        />
        <p className="text-sm text-muted-foreground">
          Include street, city, state/province, and postal code
        </p>
        {errors.address && (
          <p className="text-sm text-destructive">{errors.address.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSaving} className="w-full">
        {isSaving ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
};
