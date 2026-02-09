

# Add "Show on Homepage" Feature for Blogs

## Overview
This plan adds a toggle switch to the blog creation and editing form that allows admins to mark specific blogs to be displayed on the homepage. Featured blogs will appear after the "About" section on the homepage.

---

## What Will Be Built

### Admin Panel Enhancement
- Add a "Show on Homepage" toggle switch in the blog create/edit dialog
- The switch will be placed after the cover image field
- Easy on/off control for featuring blogs

### Homepage Blog Section
- New section after "About" displaying featured blogs
- Shows blogs where `show_on_homepage = true`
- Card layout with cover image, title, excerpt, and "Read More" link
- Only appears if there are featured blogs

---

## Implementation Steps

### Step 1: Database Migration
Add a new column to the `blogs` table:
- Column: `show_on_homepage` (boolean, default: false)
- This allows filtering blogs to display on the homepage

### Step 2: Update Blog Management Form
Modify `src/pages/admin/BlogsManagement.tsx`:
- Add a Switch component from shadcn/ui
- Label: "Show on Homepage"
- Include in both create and edit flows
- Store the value in form state and submit with blog data

### Step 3: Add Featured Blogs Section to Homepage
Modify `src/pages/Home.tsx`:
- Add a new query to fetch blogs where `show_on_homepage = true`
- Create a "Featured Posts" or "Latest News" section
- Position it after the About section
- Use a responsive grid layout (similar to the Blogs page)
- Only render the section if featured blogs exist

---

## Technical Details

### Database Migration SQL
```text
-- Add show_on_homepage column to blogs table
ALTER TABLE public.blogs 
ADD COLUMN show_on_homepage BOOLEAN NOT NULL DEFAULT false;
```

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/admin/BlogsManagement.tsx` | Add Switch component for "Show on Homepage" toggle |
| `src/pages/Home.tsx` | Add query for featured blogs and render new section |

### BlogsManagement Form Changes
- Import Switch component
- Add state: `showOnHomepage` (initialized from `editingBlog?.show_on_homepage`)
- Add Switch UI after cover image section
- Include `show_on_homepage: showOnHomepage` in `blogData` object

### Homepage Section Design
- Title: "Latest News" or "Featured Posts"
- Grid layout: 1 column mobile, 2-3 columns desktop
- Each card shows:
  - Cover image (if available)
  - Blog title
  - Publish date
  - Excerpt (truncated)
  - "Read More" button linking to full blog post
- Limit to 3-6 featured blogs for clean presentation

---

## User Experience

**For Admins:**
1. Navigate to Admin Panel > Blogs
2. Click "Add Blog" or edit an existing blog
3. Fill in blog details
4. Toggle "Show on Homepage" switch ON to feature the blog
5. Save the blog
6. The blog now appears on the homepage

**For Visitors:**
1. Visit the homepage
2. Scroll to the "Latest News" section (after About)
3. See featured blog posts with images and excerpts
4. Click "Read More" to view the full blog post

