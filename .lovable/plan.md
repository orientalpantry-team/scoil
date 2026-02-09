

# Enrollment Section & Admin Management Implementation Plan

## Overview
This plan adds an **Enrollment Section** to the homepage where visitors can download enrollment forms, along with an **Admin Management Page** for uploading and managing enrollment documents.

---

## What Will Be Built

### Frontend (Public)
- New "Enrollment" section on the homepage with:
  - Section title and description
  - List of downloadable enrollment forms/documents
  - Download buttons for each document

### Backend (Admin)
- New "Enrollment" admin page for managing enrollment documents
- Ability to upload PDF/Word documents or provide external URLs
- Edit and delete functionality for enrollment documents

---

## Implementation Steps

### Step 1: Create Database Table
Create a new `enrollment_forms` table to store enrollment documents:
- `id` - unique identifier
- `title` - document name (e.g., "Enrollment Application Form")
- `description` - optional description
- `file_url` - link to the downloadable file
- `display_order` - for ordering documents
- `created_at` - timestamp

### Step 2: Set Up Storage Bucket
Create an `enrollment` storage bucket for uploaded files with public access.

### Step 3: Configure Row-Level Security
- Public users can view enrollment forms (SELECT)
- Only admins can add, edit, or delete forms (INSERT, UPDATE, DELETE)

### Step 4: Create Admin Page
Create `src/pages/admin/EnrollmentManagement.tsx`:
- List all enrollment documents
- Dialog form for adding/editing documents
- File upload or URL input options (like Policies page)
- Delete functionality with confirmation
- Display order management

### Step 5: Update Admin Navigation
Add the Enrollment menu item to `AdminLayout.tsx` with appropriate icon and role permissions.

### Step 6: Add Route
Register the new admin route in `App.tsx`.

### Step 7: Add Enrollment Section to Homepage
Add a new section to `Home.tsx`:
- Fetch enrollment forms from database
- Display with download buttons
- Styled consistently with other sections

---

## Technical Details

### Database Migration SQL
```text
-- Create enrollment_forms table
CREATE TABLE public.enrollment_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.enrollment_forms ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view enrollment forms"
  ON public.enrollment_forms FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert enrollment forms"
  ON public.enrollment_forms FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update enrollment forms"
  ON public.enrollment_forms FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete enrollment forms"
  ON public.enrollment_forms FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('enrollment', 'enrollment', true);

-- Storage policies
CREATE POLICY "Public can view enrollment files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'enrollment');

CREATE POLICY "Admins can upload enrollment files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'enrollment' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update enrollment files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'enrollment' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete enrollment files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'enrollment' AND has_role(auth.uid(), 'admin'));
```

### Files to Create/Modify

| File | Action |
|------|--------|
| `src/pages/admin/EnrollmentManagement.tsx` | Create new admin page |
| `src/components/admin/AdminLayout.tsx` | Add navigation item |
| `src/App.tsx` | Add route |
| `src/pages/Home.tsx` | Add enrollment section |

### Admin Navigation Addition
Add to `allNavItems` array:
```text
{ path: "/admin/enrollment", label: "Enrollment", icon: ClipboardList, roles: ["editor", "admin"] }
```

### Homepage Section Design
- Placed after Features section (visible early on page)
- Card-based layout for each downloadable form
- Download icon button for each document
- Responsive grid: 1 column mobile, 2-3 columns desktop

---

## User Experience

**For Visitors:**
1. Scroll to "Enrollment" section on homepage
2. See list of available enrollment forms
3. Click download button to get the PDF/document

**For Admins:**
1. Navigate to Admin Panel > Enrollment
2. Click "Add Document" to upload new forms
3. Either upload a file or paste an external URL
4. Reorder, edit, or delete documents as needed

