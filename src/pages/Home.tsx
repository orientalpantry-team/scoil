import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Users, Award, Heart, Star } from "lucide-react";
import { toast } from "sonner";

const Home = () => {
  const { data: heroData } = useQuery({
    queryKey: ["section", "home.hero"],
    queryFn: async () => {
      const { data } = await supabase
        .from("sections")
        .select("content")
        .eq("key", "home.hero")
        .single();
      return data?.content as any;
    },
  });

  const { data: aboutData } = useQuery({
    queryKey: ["section", "home.about"],
    queryFn: async () => {
      const { data } = await supabase
        .from("sections")
        .select("content")
        .eq("key", "home.about")
        .single();
      return data?.content as any;
    },
  });

  const { data: testimonials } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const { data } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);
      return data || [];
    },
  });

  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("Thank you! We'll get back to you soon.");
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary/90 to-accent py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
            {heroData?.slides?.[0]?.title || "Welcome to Our School"}
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8">
            {heroData?.slides?.[0]?.subtitle || "Building Future Leaders"}
          </p>
          <Button size="lg" variant="secondary">
            Learn More About Us
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose Our School
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold text-lg mb-2">Quality Education</h3>
                <p className="text-muted-foreground">
                  Comprehensive curriculum designed for excellence
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-secondary" />
                <h3 className="font-semibold text-lg mb-2">Expert Teachers</h3>
                <p className="text-muted-foreground">
                  Dedicated and experienced faculty members
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Award className="h-12 w-12 mx-auto mb-4 text-accent" />
                <h3 className="font-semibold text-lg mb-2">Excellence</h3>
                <p className="text-muted-foreground">
                  Track record of outstanding achievements
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Heart className="h-12 w-12 mx-auto mb-4 text-destructive" />
                <h3 className="font-semibold text-lg mb-2">Caring Environment</h3>
                <p className="text-muted-foreground">
                  Nurturing and supportive atmosphere
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            What Parents Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials?.map((testimonial) => (
              <Card key={testimonial.id}>
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-3">
                    {[...Array(testimonial.rating || 5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.message}"</p>
                  <p className="font-semibold">- {testimonial.parent_name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {aboutData?.title || "About Us"}
            </h2>
            <p className="text-lg text-muted-foreground">
              {aboutData?.content || "We are dedicated to providing quality education and nurturing young minds to become responsible global citizens. Our experienced faculty and modern facilities create an ideal learning environment."}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
              Get in Touch
            </h2>
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <Input placeholder="Your Name" required />
                  </div>
                  <div>
                    <Input type="email" placeholder="Your Email" required />
                  </div>
                  <div>
                    <Textarea placeholder="Your Message" required rows={5} />
                  </div>
                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
