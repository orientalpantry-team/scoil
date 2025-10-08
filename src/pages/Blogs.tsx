import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "lucide-react";
import PageTitle from "@/components/layout/PageTitle";

const Blogs = () => {
  const { data: blogs, isLoading } = useQuery({
    queryKey: ["blogs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("blogs")
        .select("*")
        .order("published_at", { ascending: false });
      return data || [];
    },
  });

  return (
    <div className="min-h-screen">
      <PageTitle 
        title="School Blog" 
        description="Latest news and updates from our school"
        pageKey="blogsPage"
      />
      <div className="container mx-auto px-4 pb-16">

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-96 w-full" />
            ))}
          </div>
        ) : blogs && blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <Card key={blog.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {blog.cover_image && (
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={blog.cover_image}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="line-clamp-2">{blog.title}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(blog.published_at).toLocaleDateString()}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3 mb-4">
                    {blog.excerpt || blog.content.substring(0, 150) + "..."}
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link to={`/blogs/${blog.slug}`}>Read More</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No blog posts yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blogs;
