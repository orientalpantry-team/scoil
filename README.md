# scoil

🏫 Software Requirements Specification (SRS)
School Website with CMS
Technology Stack: React + Node.js (Express) + Supabase (PostgreSQL, Auth, Storage)
1. Introduction
1.1 Purpose
This project aims to create a modern, responsive school website that allows the public to learn about the school’s values, activities, and updates, while providing administrators with a secure content management system (CMS) to easily manage all pages and media through a Supabase backend.
1.2 Scope
The system includes:
A public-facing website with:


Home page (slider, features, testimonials, about us, contact us)


Gallery page


Blogs page (with individual blog detail pages)


Policies page


Calendar page (with upcoming events)


A backend CMS (admin panel) for managing:


Page content and sections


Blogs and events


Policies


Gallery images


Contact details


1.3 Users
User
Role
Public Visitor
Views website content
Administrator
Manages content via secure CMS login

1.4 Technology Stack
Layer
Technology
Frontend
React (Vite) + Tailwind CSS + Axios
Backend
Node.js (Express.js)
Database
Supabase PostgreSQL
Authentication
Supabase Auth (JWT-based)
Storage
Supabase Storage
Hosting
Frontend → Vercel / Netlify; Backend → Render / Railway


2. Functional Requirements
2.1 Public Website Pages
Page
Description
Admin Control
Home
Includes hero slider, school features, parent testimonials, about us, and contact information
Full content editable from CMS
Gallery
Displays school event and activity photos in a grid or carousel
Upload / delete images
Blogs
Displays latest school news and articles
CRUD for blog posts
Blog Details
Individual post page with comments (optional)
Editable from CMS
Policies
Lists school policies (PDFs or text-based)
Upload and manage policy entries
Calendar
Displays upcoming school events with dates and details
CRUD for events
Contact Us (on Home)
Contact info and message form
Admin editable contact info; optional message storage


2.2 Admin CMS Features
Feature
Description
Authentication
Secure login using Supabase Auth
Dashboard Overview
Displays total blogs, events, gallery items
Section Management
Edit content of Home page sections (slider, features, testimonials, about, contact)
Gallery Management
Upload/delete images stored in Supabase bucket
Blog Management
Add, edit, delete blog posts
Policy Management
Add/edit policies and upload PDFs
Event Management
Add/edit/delete school events (for calendar page)
File Uploads
Manage uploaded files (images, PDFs) using Supabase Storage
Audit Logs (optional)
Track who updated content and when


3. Non-Functional Requirements
Category
Description
Performance
Pages load within 2 seconds on average connection
Scalability
Supabase handles concurrent requests efficiently
Security
JWT verification, input sanitization, CORS control
Usability
User-friendly, accessible CMS interface
Reliability
Supabase uptime ≥ 99%
Backup
Supabase auto backups enabled
Maintainability
Clear modular structure for frontend and backend
Responsiveness
Works on desktop, tablet, and mobile


4. System Architecture
4.1 Architecture Overview
  ┌────────────────────┐         ┌────────────────────┐         ┌──────────────────────┐
   │  React Frontend    │ <---->  │  Node.js Backend   │ <---->  │   Supabase Services  │
   │ (Public + CMS UI)  │         │ (Express REST API) │         │ (DB, Auth, Storage)  │
   └────────────────────┘         └────────────────────┘         └──────────────────────┘


4.2 Data Flow
Public pages fetch data via REST API or Supabase client SDK.


Admin logs in → Supabase Auth returns JWT.


Admin edits a section → Node.js backend updates Supabase DB.


Files (images, PDFs) are uploaded directly to Supabase Storage.



5. Database Design (Supabase)
5.1 Tables
sections
Stores JSON content for specific home page sections.
Column
Type
Description
id
UUID
Primary key
key
TEXT
Unique identifier (e.g. home.slider, home.features)
content
JSONB
JSON object with text/images
updated_at
TIMESTAMP
Last update time

blogs
Column
Type
Description
id
UUID
Blog ID
title
TEXT
Blog title
slug
TEXT
URL slug
excerpt
TEXT
Short preview
content
TEXT
Blog content
cover_image
TEXT
URL to Supabase Storage
published_at
TIMESTAMP
Publication date

events
Column
Type
Description
id
UUID
Event ID
title
TEXT
Event name
start_date
DATE
Start date
end_date
DATE
End date
description
TEXT
Event details

testimonials
Column
Type
Description
id
UUID
Testimonial ID
parent_name
TEXT
Parent’s name
message
TEXT
Feedback text
rating
INTEGER
Optional (1–5)

policies
Column
Type
Description
id
UUID
Policy ID
title
TEXT
Policy title
file_url
TEXT
PDF link in Supabase Storage
description
TEXT
Short description


5.2 Supabase Storage Buckets
Bucket Name
Purpose
uploads
General image uploads
gallery
Gallery photos
blogs
Blog cover images
policies
Policy PDFs


6. API Endpoints (Node.js + Supabase)
Endpoint
Method
Description
/api/auth/login
POST
Admin login via Supabase Auth
/api/sections/:key
GET
Get content for a section
/api/sections/:key
POST
Update content of a section
/api/blogs
GET
List all blogs
/api/blogs/:slug
GET
Get single blog
/api/blogs
POST
Create new blog
/api/events
GET
Get all events
/api/events
POST
Add or update event
/api/gallery
GET
Get all gallery images
/api/gallery
POST
Upload new image
/api/policies
GET
Get all policies
/api/policies
POST
Add or update policy


7. Frontend Structure (React)
Page
Components Included
Home.jsx
Slider, Features, Testimonials, About, Contact
Gallery.jsx
Photo grid fetched from /api/gallery
Blogs.jsx
Blog list
BlogDetail.jsx
Single blog view
Policies.jsx
List of school policies with PDF links
Calendar.jsx
Calendar view showing events


8. Software & Hardware Requirements
Category
Specification
Server
Node.js 20+, 1GB RAM, 10GB Storage
Database
Supabase PostgreSQL
Frontend
React 18+, Vite, Tailwind CSS
Client
Modern browser (Chrome, Firefox, Safari, Edge)
Development Tools
VS Code, Git, Postman
Hosting
Backend → Render/Railway; Frontend → Vercel


9. Testing Plan
Type
Description
Unit Testing
Backend route and API tests using Jest
Integration Testing
Supabase API and database queries
UI Testing
Browser responsiveness and accessibility
Acceptance Testing
Admin verifies content edits appear live
Security Testing
Test Supabase policies and JWT validation


10. Deployment
10.1 Environment Variables
SUPABASE_URL=<project-url>
SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
PORT=5000

10.2 Deployment Steps
Create a new Supabase project


Create tables and buckets listed above


Deploy backend (Node.js) with environment variables


Deploy frontend (React) to Vercel


Configure CORS and storage access policies



11. Future Enhancements
Multiple admin roles (Editor, Super Admin)


Multilingual support


Parent login for private announcements


Online admission form


Notifications for new blogs/events



Would you like me to generate next:
🧩 The project structure and starter code (React + Node.js + Supabase setup), or


📘 A formatted PDF version of this SRS for documentation or client presentation?

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://scoil.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/96f99dd6-942f-4d40-acac-301986363714).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
