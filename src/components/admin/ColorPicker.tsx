import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

export const ColorPicker = ({ label, value, onChange, description }: ColorPickerProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={label}>{label}</Label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <div className="flex gap-3 items-center">
        <div 
          className="w-12 h-12 rounded-md border-2 border-border shadow-sm"
          style={{ backgroundColor: `hsl(${value})` }}
        />
        <Input
          id={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g., 215 70% 35%"
          className="flex-1"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Format: H S% L% (e.g., 215 70% 35%)
      </p>
    </div>
  );
};
