import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon, X } from "lucide-react";
import PageTitle from "@/components/layout/PageTitle";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const Calendar = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const itemsPerPage = 10;

  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  // Filter events by date range
  const filteredEvents = events?.filter((event) => {
    if (!fromDate && !toDate) return true;
    
    const eventDate = new Date(event.start_date);
    const from = fromDate ? new Date(fromDate.setHours(0, 0, 0, 0)) : null;
    const to = toDate ? new Date(toDate.setHours(23, 59, 59, 999)) : null;
    
    if (from && to) {
      return eventDate >= from && eventDate <= to;
    } else if (from) {
      return eventDate >= from;
    } else if (to) {
      return eventDate <= to;
    }
    return true;
  }) || [];

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

  const clearFilters = () => {
    setFromDate(undefined);
    setToDate(undefined);
    setCurrentPage(1);
  };

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
    <div className="min-h-screen">
      <PageTitle 
        title="School Calendar" 
        description="Upcoming events and important dates"
        pageKey="calendarPage"
      />
      <div className="container mx-auto px-4 pb-16">
        {/* Date Range Filter */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[200px] justify-start text-left font-normal",
                      !fromDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, "PPP") : "From date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarPicker
                    mode="single"
                    selected={fromDate}
                    onSelect={setFromDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              <span className="text-muted-foreground">to</span>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[200px] justify-start text-left font-normal",
                      !toDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "PPP") : "To date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarPicker
                    mode="single"
                    selected={toDate}
                    onSelect={setToDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              {(fromDate || toDate) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearFilters}
                  className="h-10 w-10"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>


        {isLoading ? (
          <div className="max-w-4xl mx-auto space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : events && events.length > 0 ? (
          <>
            <div className="max-w-4xl mx-auto space-y-4 mb-8">
              {paginatedEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <CalendarIcon className="h-6 w-6 text-accent" />
                      {event.title}
                    </CardTitle>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Event Date: </span>
                        {new Date(event.start_date).toLocaleDateString()}
                        {event.end_date && event.end_date !== event.start_date && (
                          <> - {new Date(event.end_date).toLocaleDateString()}</>
                        )}
                      </div>
                      {event.created_at && (
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">Added: </span>
                          {new Date(event.created_at).toLocaleString()}
                        </div>
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
            
            {totalPages > 1 && (
              <div className="max-w-4xl mx-auto mb-12">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <PaginationItem key={i + 1}>
                        <PaginationLink
                          onClick={() => setCurrentPage(i + 1)}
                          isActive={currentPage === i + 1}
                          className="cursor-pointer"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
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
