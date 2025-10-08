import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon } from "lucide-react";

const Calendar = () => {
  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .order("start_date", { ascending: true });
      return data || [];
    },
  });

  const { data: googleCalendarData } = useQuery({
    queryKey: ["googleCalendar"],
    queryFn: async () => {
      const { data } = await supabase
        .from("sections")
        .select("content")
        .eq("key", "calendar.google")
        .single();
      return data?.content as { url: string } | null;
    },
  });

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
          School Calendar
        </h1>
        <p className="text-center text-muted-foreground mb-12 text-lg">
          Upcoming events and important dates
        </p>

        {isLoading ? (
          <div className="max-w-4xl mx-auto space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : events && events.length > 0 ? (
          <div className="max-w-4xl mx-auto space-y-4 mb-12">
            {events.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <CalendarIcon className="h-6 w-6 text-accent" />
                    {event.title}
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {new Date(event.start_date).toLocaleDateString()}
                    {event.end_date && event.end_date !== event.start_date && (
                      <> - {new Date(event.end_date).toLocaleDateString()}</>
                    )}
                  </div>
                </CardHeader>
                {event.description && (
                  <CardContent>
                    <p className="text-muted-foreground">{event.description}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No upcoming events.</p>
          </div>
        )}

        {/* Google Calendar Embed */}
        {googleCalendarData?.url && (
          <div className="max-w-4xl mx-auto mt-16">
            <h2 className="text-3xl font-bold text-center mb-8">Full Calendar</h2>
            <Card>
              <CardContent className="p-0">
                <div className="relative w-full" style={{ paddingBottom: "75%" }}>
                  <iframe
                    src={googleCalendarData.url}
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    frameBorder="0"
                    scrolling="no"
                    title="School Google Calendar"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
