import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ArrowLeft } from "lucide-react";

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: blog, isLoading } = useQuery({
    queryKey: ["blog", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("blogs")
        .select("*")
        .eq("slug", slug)
        .single();
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Skeleton className="h-96 w-full mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-4 w-1/4 mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Blog post not found</h1>
          <Button asChild>
            <Link to="/blogs">Back to Blogs</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/blogs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blogs
          </Link>
        </Button>

        {blog.cover_image && (
          <div className="aspect-video relative overflow-hidden rounded-lg mb-8">
            <img
              src={blog.cover_image}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <h1 className="text-4xl md:text-5xl font-bold mb-4">{blog.title}</h1>
        
        <div className="flex items-center gap-2 text-muted-foreground mb-8">
          <Calendar className="h-4 w-4" />
          {new Date(blog.published_at).toLocaleDateString()}
        </div>

        <div className="prose prose-lg max-w-none">
          <p className="whitespace-pre-wrap">{blog.content}</p>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
