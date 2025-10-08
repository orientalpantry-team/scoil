import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Users, Award, Heart, Star } from "lucide-react";
import { toast } from "sonner";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useTheme } from "@/contexts/ThemeContext";
import { useState, useRef } from "react";

const Home = () => {
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastSubmitTime = useRef<number>(0);
  const formMountTime = useRef<number>(Date.now());
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

  const { data: featuresData } = useQuery({
    queryKey: ["section", "home.features"],
    queryFn: async () => {
      const { data } = await supabase
        .from("sections")
        .select("content")
        .eq("key", "home.features")
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

  const { data: contactData } = useQuery({
    queryKey: ["section", "home.contact"],
    queryFn: async () => {
      const { data } = await supabase
        .from("sections")
        .select("content")
        .eq("key", "home.contact")
        .single();
      return data?.content as any;
    },
  });

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    const formData = new FormData(e.currentTarget);
    
    // Honeypot check - if this field is filled, it's likely a bot
    const honeypot = formData.get("website") as string;
    if (honeypot) {
      toast.error("Invalid submission detected.");
      return;
    }
    
    // Rate limiting - prevent submissions within 30 seconds
    const now = Date.now();
    if (now - lastSubmitTime.current < 30000) {
      toast.error("Please wait before submitting again.");
      return;
    }
    
    // Time-based check - form must be visible for at least 3 seconds
    if (now - formMountTime.current < 3000) {
      toast.error("Please take your time filling out the form.");
      return;
    }
    
    setIsSubmitting(true);
    
    const { error } = await supabase.from("contact_messages").insert({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      message: formData.get("message") as string,
    });

    if (error) {
      toast.error("Failed to send message. Please try again.");
      console.error("Error saving contact message:", error);
      setIsSubmitting(false);
      return;
    }

    lastSubmitTime.current = now;
    toast.success("Thank you! We'll get back to you soon.");
    (e.target as HTMLFormElement).reset();
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 5000,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent>
          {(heroData?.slides || [{ title: "Welcome to Our School", subtitle: "Building Future Leaders", image: "" }]).map((slide: any, index: number) => (
            <CarouselItem key={index}>
              <section 
                className="relative py-20 md:py-32 bg-cover bg-center bg-no-repeat min-h-[500px] flex items-center"
                style={{
                  backgroundImage: theme?.section_styles?.hero?.backgroundImage 
                    ? `linear-gradient(rgba(0, 0, 0, ${theme.section_styles.hero.overlayOpacity || 0.5}), rgba(0, 0, 0, ${theme.section_styles.hero.overlayOpacity || 0.5})), url(${theme.section_styles.hero.backgroundImage})`
                    : slide.image 
                      ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${slide.image})`
                      : 'linear-gradient(to bottom right, hsl(var(--primary)), hsl(var(--accent)))'
                }}
              >
                <div className="container mx-auto px-4 text-center">
                  <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
                    {slide.title}
                  </h1>
                  <p className="text-xl md:text-2xl text-white/90 animate-fade-in">
                    {slide.subtitle}
                  </p>
                </div>
              </section>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>

      {/* Features Section */}
      <section 
        className="py-16 bg-muted/30 bg-cover bg-center"
        style={{
          backgroundImage: theme?.section_styles?.features?.backgroundImage 
            ? `linear-gradient(rgba(255, 255, 255, ${1 - (theme.section_styles.features.overlayOpacity || 0)}), rgba(255, 255, 255, ${1 - (theme.section_styles.features.overlayOpacity || 0)})), url(${theme.section_styles.features.backgroundImage})`
            : undefined
        }}
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {featuresData?.title || "Why Choose Our School"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(featuresData?.features || []).map((feature: any, index: number) => {
              const iconMap: Record<string, any> = {
                BookOpen,
                Users,
                Award,
                Heart,
              };
              const IconComponent = iconMap[feature.icon] || BookOpen;
              
              return (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="pt-6 text-center">
                    {feature.image ? (
                      <div className="w-full h-40 mb-4">
                        <img 
                          src={feature.image} 
                          alt={feature.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    ) : (
                      <IconComponent className="h-12 w-12 mx-auto mb-4 text-primary" />
                    )}
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section 
        className="py-16 bg-cover bg-center"
        style={{
          backgroundImage: theme?.section_styles?.testimonials?.backgroundImage 
            ? `linear-gradient(rgba(255, 255, 255, ${1 - (theme.section_styles.testimonials.overlayOpacity || 0)}), rgba(255, 255, 255, ${1 - (theme.section_styles.testimonials.overlayOpacity || 0)})), url(${theme.section_styles.testimonials.backgroundImage})`
            : undefined
        }}
      >
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
                      <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
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
      <section 
        className="py-16 bg-muted/30 bg-cover bg-center"
        style={{
          backgroundImage: theme?.section_styles?.about?.backgroundImage 
            ? `linear-gradient(rgba(255, 255, 255, ${1 - (theme.section_styles.about.overlayOpacity || 0)}), rgba(255, 255, 255, ${1 - (theme.section_styles.about.overlayOpacity || 0)})), url(${theme.section_styles.about.backgroundImage})`
            : undefined
        }}
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {aboutData?.title || "About Us"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {aboutData?.image && (
              <div>
                <img 
                  src={aboutData.image} 
                  alt={aboutData.title || "About Us"} 
                  className="w-full h-auto rounded-lg shadow-lg object-cover"
                />
              </div>
            )}
            <div>
              <p className="text-lg text-muted-foreground whitespace-pre-wrap">
                {aboutData?.content || "We are dedicated to providing quality education and nurturing young minds to become responsible global citizens. Our experienced faculty and modern facilities create an ideal learning environment."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section 
        className="py-16 bg-cover bg-center"
        style={{
          backgroundImage: theme?.section_styles?.contact?.backgroundImage 
            ? `linear-gradient(rgba(255, 255, 255, ${1 - (theme.section_styles.contact.overlayOpacity || 0)}), rgba(255, 255, 255, ${1 - (theme.section_styles.contact.overlayOpacity || 0)})), url(${theme.section_styles.contact.backgroundImage})`
            : undefined
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
              Get in Touch
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Information */}
              {contactData && (
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">School Information</h3>
                      <p className="text-xl font-bold text-primary">{contactData.schoolName}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Phone</h4>
                      <p className="text-muted-foreground">{contactData.phone}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Email</h4>
                      <p className="text-muted-foreground">{contactData.email}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Address</h4>
                      <p className="text-muted-foreground whitespace-pre-wrap">{contactData.address}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Contact Form */}
              <Card>
                <CardContent className="pt-6">
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    {/* Honeypot field - hidden from users but bots will fill it */}
                    <input
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      style={{
                        position: "absolute",
                        left: "-9999px",
                        width: "1px",
                        height: "1px",
                      }}
                      aria-hidden="true"
                    />
                    <div>
                      <Input name="name" placeholder="Your Name" required maxLength={100} />
                    </div>
                    <div>
                      <Input name="email" type="email" placeholder="Your Email" required maxLength={255} />
                    </div>
                    <div>
                      <Textarea name="message" placeholder="Your Message" required rows={5} maxLength={1000} />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
