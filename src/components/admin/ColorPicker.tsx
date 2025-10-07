import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

// Convert HSL to Hex
const hslToHex = (hsl: string): string => {
  const [h, s, l] = hsl.split(' ').map(v => parseFloat(v));
  const hDecimal = h / 360;
  const sDecimal = s / 100;
  const lDecimal = l / 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;
  if (sDecimal === 0) {
    r = g = b = lDecimal;
  } else {
    const q = lDecimal < 0.5 ? lDecimal * (1 + sDecimal) : lDecimal + sDecimal - lDecimal * sDecimal;
    const p = 2 * lDecimal - q;
    r = hue2rgb(p, q, hDecimal + 1/3);
    g = hue2rgb(p, q, hDecimal);
    b = hue2rgb(p, q, hDecimal - 1/3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Convert Hex to HSL
const hexToHsl = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

export const ColorPicker = ({ label, value, onChange, description }: ColorPickerProps) => {
  const [hexValue, setHexValue] = useState(hslToHex(value || "0 0% 50%"));

  const handleHexChange = (hex: string) => {
    setHexValue(hex);
    onChange(hexToHsl(hex));
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={label}>{label}</Label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <div className="flex gap-3 items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-12 h-12 p-0 border-2"
              style={{ backgroundColor: `hsl(${value})` }}
            />
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3">
            <div className="space-y-3">
              <div>
                <Label>Pick a color</Label>
                <input
                  type="color"
                  value={hexValue}
                  onChange={(e) => handleHexChange(e.target.value)}
                  className="w-full h-32 cursor-pointer rounded border"
                />
              </div>
              <div>
                <Label>Hex</Label>
                <Input
                  value={hexValue}
                  onChange={(e) => handleHexChange(e.target.value)}
                  placeholder="#000000"
                />
              </div>
              <div>
                <Label>HSL</Label>
                <Input
                  value={value}
                  onChange={(e) => {
                    onChange(e.target.value);
                    setHexValue(hslToHex(e.target.value));
                  }}
                  placeholder="0 0% 0%"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Input
          id={label}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            try {
              setHexValue(hslToHex(e.target.value));
            } catch (e) {
              // Invalid HSL format
            }
          }}
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
