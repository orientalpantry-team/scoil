import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Calendar, Image, FileCheck, MessageSquare, Settings } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    blogs: 0,
    events: 0,
    gallery: 0,
    policies: 0,
    testimonials: 0,
    sections: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [blogs, events, gallery, policies, testimonials, sections] = await Promise.all([
      supabase.from("blogs").select("*", { count: "exact", head: true }),
      supabase.from("events").select("*", { count: "exact", head: true }),
      supabase.from("gallery").select("*", { count: "exact", head: true }),
      supabase.from("policies").select("*", { count: "exact", head: true }),
      supabase.from("testimonials").select("*", { count: "exact", head: true }),
      supabase.from("sections").select("*", { count: "exact", head: true }),
    ]);

    setStats({
      blogs: blogs.count || 0,
      events: events.count || 0,
      gallery: gallery.count || 0,
      policies: policies.count || 0,
      testimonials: testimonials.count || 0,
      sections: sections.count || 0,
    });
  };

  const statCards = [
    { title: "Sections", value: stats.sections, icon: Settings, color: "text-blue-500" },
    { title: "Blog Posts", value: stats.blogs, icon: FileText, color: "text-green-500" },
    { title: "Events", value: stats.events, icon: Calendar, color: "text-purple-500" },
    { title: "Gallery Images", value: stats.gallery, icon: Image, color: "text-pink-500" },
    { title: "Policies", value: stats.policies, icon: FileCheck, color: "text-orange-500" },
    { title: "Testimonials", value: stats.testimonials, icon: MessageSquare, color: "text-cyan-500" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
