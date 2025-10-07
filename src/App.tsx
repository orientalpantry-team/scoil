import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import Blogs from "./pages/Blogs";
import BlogDetail from "./pages/BlogDetail";
import Policies from "./pages/Policies";
import Calendar from "./pages/Calendar";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import SectionsManagement from "./pages/admin/SectionsManagement";
import BlogsManagement from "./pages/admin/BlogsManagement";
import EventsManagement from "./pages/admin/EventsManagement";
import GalleryManagement from "./pages/admin/GalleryManagement";
import PoliciesManagement from "./pages/admin/PoliciesManagement";
import TestimonialsManagement from "./pages/admin/TestimonialsManagement";
import ContactMessages from "./pages/admin/ContactMessages";
import UserManagement from "./pages/admin/UserManagement";
import ThemeManagement from "./pages/admin/ThemeManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route
            path="/*"
            element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/blogs" element={<Blogs />} />
                    <Route path="/blogs/:slug" element={<BlogDetail />} />
                    <Route path="/policies" element={<Policies />} />
                    <Route path="/calendar" element={<Calendar />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            }
          />

          {/* Auth route */}
          <Route path="/auth" element={<Auth />} />

          {/* Admin routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/sections" element={<SectionsManagement />} />
                    <Route path="/blogs" element={<BlogsManagement />} />
                    <Route path="/events" element={<EventsManagement />} />
                    <Route path="/gallery" element={<GalleryManagement />} />
                    <Route path="/policies" element={<PoliciesManagement />} />
                    <Route path="/testimonials" element={<TestimonialsManagement />} />
                    <Route path="/contact" element={<ContactMessages />} />
                    <Route path="/users" element={<UserManagement />} />
                    <Route path="/theme" element={<ThemeManagement />} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
