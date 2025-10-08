import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PageTitleProps {
  title: string;
  description: string;
  pageKey?: "blogsPage" | "eventsPage" | "galleryPage" | "policiesPage" | "calendarPage";
}

const PageTitle = ({ title, description, pageKey }: PageTitleProps) => {
  const { data: theme } = useQuery({
    queryKey: ["active-theme"],
    queryFn: async () => {
      const { data } = await supabase
        .from("themes")
        .select("*")
        .eq("is_active", true)
        .single();
      return data;
    },
  });

  const sectionStyles = theme?.section_styles as any;
  const pageStyle = pageKey ? sectionStyles?.[pageKey] : null;
  const defaultStyle = sectionStyles?.pageTitle;
  const style = pageStyle || defaultStyle || {};

  const backgroundImage = style.backgroundImage;
  const overlayOpacity = style.overlayOpacity ?? 0.5;
  const borderImage = style.borderImage;
  const borderImageSlice = style.borderImageSlice || "30";
  const borderImageWidth = style.borderImageWidth || "20px";

  return (
    <div 
      className="relative py-16 mb-12"
      style={{
        ...(borderImage && {
          borderImage: `url(${borderImage})`,
          borderImageSlice: borderImageSlice,
          borderImageWidth: borderImageWidth,
          borderStyle: "solid",
        }),
      }}
    >
      {backgroundImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          <div
            className="absolute inset-0 bg-background"
            style={{ opacity: overlayOpacity }}
          />
        </>
      )}
      <div className="container mx-auto px-4 relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
          {title}
        </h1>
        <p className="text-center text-muted-foreground text-lg">
          {description}
        </p>
      </div>
    </div>
  );
};

export default PageTitle;
