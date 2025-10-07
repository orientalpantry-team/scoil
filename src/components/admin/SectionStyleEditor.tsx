import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { X, ImagePlus } from "lucide-react";
import { ImageSelector } from "./ImageSelector";

interface SectionStyle {
  backgroundImage?: string;
  overlayOpacity?: number;
  borderImage?: string;
  borderImageSlice?: string;
  borderImageWidth?: string;
}

interface SectionStyleEditorProps {
  title: string;
  value: SectionStyle;
  onChange: (value: SectionStyle) => void;
}

export const SectionStyleEditor = ({ title, value, onChange }: SectionStyleEditorProps) => {
  const [showBgSelector, setShowBgSelector] = useState(false);
  const [showBorderSelector, setShowBorderSelector] = useState(false);

  return (
    <div className="space-y-6 p-6 border rounded-lg">
      <h3 className="text-lg font-semibold">{title}</h3>
      
      {/* Background Image */}
      <div className="space-y-2">
        <Label>Background Image</Label>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowBgSelector(true)}
          className="w-full"
        >
          <ImagePlus className="mr-2 h-4 w-4" />
          {value.backgroundImage ? "Change Background" : "Select Background"}
        </Button>
        {showBgSelector && (
          <ImageSelector
            onSelect={(url) => {
              onChange({ ...value, backgroundImage: url });
              setShowBgSelector(false);
            }}
            onClose={() => setShowBgSelector(false)}
          />
        )}
        {value.backgroundImage && (
          <div className="flex items-center gap-2">
            <img 
              src={value.backgroundImage} 
              alt="Background preview"
              className="w-20 h-20 object-cover rounded border"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange({ ...value, backgroundImage: undefined })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Overlay Opacity */}
      {value.backgroundImage && (
        <div className="space-y-2">
          <Label>Background Overlay Opacity</Label>
          <div className="flex items-center gap-4">
            <Slider
              value={[value.overlayOpacity || 0]}
              onValueChange={([val]) => onChange({ ...value, overlayOpacity: val })}
              min={0}
              max={1}
              step={0.1}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground w-12">
              {((value.overlayOpacity || 0) * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      )}

      {/* Border Image */}
      <div className="space-y-2">
        <Label>Border Image (Decorative Frame)</Label>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowBorderSelector(true)}
          className="w-full"
        >
          <ImagePlus className="mr-2 h-4 w-4" />
          {value.borderImage ? "Change Border" : "Select Border"}
        </Button>
        {showBorderSelector && (
          <ImageSelector
            onSelect={(url) => {
              onChange({ ...value, borderImage: url });
              setShowBorderSelector(false);
            }}
            onClose={() => setShowBorderSelector(false)}
          />
        )}
        {value.borderImage && (
          <div className="flex items-center gap-2">
            <img 
              src={value.borderImage} 
              alt="Border preview"
              className="w-20 h-20 object-cover rounded border"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange({ ...value, borderImage: undefined })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Border Image Properties */}
      {value.borderImage && (
        <>
          <div className="space-y-2">
            <Label>Border Image Slice</Label>
            <Input
              value={value.borderImageSlice || "30"}
              onChange={(e) => onChange({ ...value, borderImageSlice: e.target.value })}
              placeholder="e.g., 30"
            />
            <p className="text-xs text-muted-foreground">
              How to slice the border image (typically 10-50)
            </p>
          </div>

          <div className="space-y-2">
            <Label>Border Width</Label>
            <Input
              value={value.borderImageWidth || "10px"}
              onChange={(e) => onChange({ ...value, borderImageWidth: e.target.value })}
              placeholder="e.g., 10px"
            />
          </div>
        </>
      )}
    </div>
  );
};
