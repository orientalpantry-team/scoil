

# Enrollment Navigation and Background Customization

## Overview
This plan adds two features:
1. **Top Menu Navigation** - Add "Enrollment" link to the main navbar for quick access to the enrollment section on the homepage
2. **Background Customization** - Add controls in the Enrollment admin page to change the section's background image and color

---

## What Will Be Built

### Top Navigation Enhancement
- Add "Enrollment" to the main navigation bar
- Clicking it scrolls to the enrollment section on the homepage (using anchor link)
- Works on both desktop and mobile views

### Admin Background Controls
- New "Section Settings" area in the Enrollment Management page
- Background image upload functionality (using existing gallery/uploads bucket)
- Background color picker
- Overlay opacity control for images
- Settings saved to the `sections` table with key `home.enrollment`

---

## Implementation Steps

### Step 1: Add Enrollment to Navigation Bar
Modify `src/components/layout/Navbar.tsx`:
- Add new nav link object for "Enrollment" pointing to `/#enrollment`
- The link navigates to home page and scrolls to the enrollment section

### Step 2: Add Section ID to Homepage
Modify `src/pages/Home.tsx`:
- Add `id="enrollment"` attribute to the enrollment section
- This enables anchor linking from the navbar

### Step 3: Create Database Entry for Enrollment Section Styles
Create a new entry in the `sections` table:
- Key: `home.enrollment`
- Content: JSON object with `backgroundImage`, `backgroundColor`, `overlayOpacity`

### Step 4: Update Enrollment Admin Page
Modify `src/pages/admin/EnrollmentManagement.tsx`:
- Add a new "Section Settings" card at the top of the page
- Include:
  - Background image selector (reusing existing ImageSelector component)
  - Color picker for background color
  - Overlay opacity slider (when image is set)
- Save changes to the `sections` table

### Step 5: Apply Background Styles to Homepage
Modify `src/pages/Home.tsx`:
- Fetch enrollment section settings from `sections` table
- Apply background image and/or background color to the enrollment section
- Handle overlay opacity for image backgrounds

---

## Technical Details

### Database Changes
No new tables required. We'll use the existing `sections` table with a new key:

```text
Key: home.enrollment
Content structure:
{
  "backgroundImage": "https://...",
  "backgroundColor": "215 70% 35%",
  "overlayOpacity": 0.5
}
```

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/layout/Navbar.tsx` | Add "Enrollment" nav link with anchor to `/#enrollment` |
| `src/pages/Home.tsx` | Add section ID, fetch enrollment styles, apply background |
| `src/pages/admin/EnrollmentManagement.tsx` | Add Section Settings card with background controls |

### Component Reuse
- Use existing `ImageSelector` component for background image selection
- Use existing `ColorPicker` component for background color
- Use Shadcn `Slider` component for overlay opacity

### Navbar Link Structure
```text
{ to: "/#enrollment", label: "Enrollment" }
```

The link will:
1. Navigate to the home page
2. Scroll to the element with `id="enrollment"`

### Background Style Logic
The enrollment section will support:
- **Background color only** - Solid color background
- **Background image only** - Image with configurable overlay opacity
- **Both** - Image overlaid on the color

---

## User Experience

**For Visitors:**
1. Click "Enrollment" in the top navigation
2. Instantly scroll to the enrollment section on the homepage
3. See the section with customized background styling

**For Admins:**
1. Navigate to Admin Panel > Enrollment
2. See "Section Settings" card at the top
3. Upload a background image or select from gallery
4. Choose a background color using the color picker
5. Adjust overlay opacity if using an image
6. Click "Save Settings" to apply changes
7. Changes appear immediately on the public homepage

