import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2, Upload, Image as ImageIcon } from "lucide-react";
import { ImageSelector } from "@/components/admin/ImageSelector";

interface Event {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string | null;
  image_url: string | null;
}

const EventsManagement = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectingImage, setSelectingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [googleCalendarUrl, setGoogleCalendarUrl] = useState("");
  const [savingCalendar, setSavingCalendar] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
    fetchGoogleCalendarUrl();
  }, []);

  const fetchGoogleCalendarUrl = async () => {
    const { data } = await supabase
      .from("sections")
      .select("content")
      .eq("key", "calendar.google")
      .single();
    
    if (data?.content && typeof data.content === 'object' && 'url' in data.content) {
      setGoogleCalendarUrl((data.content as { url: string }).url || "");
    }
  };

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("start_date", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    const { error } = await supabase.from("events").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
      fetchEvents();
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("uploads")
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      toast({ title: "Success", description: "Image uploaded successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleImageSelect = (url: string) => {
    setImageUrl(url);
    setSelectingImage(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const eventData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      start_date: formData.get("start_date") as string,
      end_date: (formData.get("end_date") as string) || null,
      image_url: imageUrl || null,
    };

    let error;
    if (editingEvent) {
      ({ error } = await supabase
        .from("events")
        .update(eventData)
        .eq("id", editingEvent.id));
    } else {
      ({ error } = await supabase.from("events").insert([eventData]));
    }

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Event ${editingEvent ? "updated" : "created"} successfully`,
      });
      setOpen(false);
      setEditingEvent(null);
      setImageUrl("");
      fetchEvents();
    }
  };

  const handleSaveGoogleCalendar = async () => {
    setSavingCalendar(true);
    const { error } = await supabase
      .from("sections")
      .update({ content: { url: googleCalendarUrl } })
      .eq("key", "calendar.google");

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Google Calendar link saved successfully",
      });
    }
    setSavingCalendar(false);
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Events Management</h1>
        <Dialog open={open} onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            setEditingEvent(null);
            setImageUrl("");
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingEvent(null);
              setImageUrl("");
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingEvent ? "Edit Event" : "Add New Event"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editingEvent?.title}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingEvent?.description}
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  defaultValue={editingEvent?.start_date}
                  required
                />
              </div>
              <div>
                <Label htmlFor="end_date">End Date (Optional)</Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="date"
                  defaultValue={editingEvent?.end_date || ""}
                />
              </div>
              <div>
                <Label htmlFor="image">Event Image</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectingImage(true)}
                      className="flex-1"
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Select from Gallery
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploading}
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) handleImageUpload(file);
                        };
                        input.click();
                      }}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  {(imageUrl || editingEvent?.image_url) && (
                    <img
                      src={imageUrl || editingEvent?.image_url || ""}
                      alt="Event preview"
                      className="w-full h-48 object-cover rounded-md"
                    />
                  )}
                </div>
              </div>
              <Button type="submit" className="w-full">
                {editingEvent ? "Update" : "Create"} Event
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Google Calendar Configuration */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Google Calendar Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="googleCalendar">Google Calendar Embed URL</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Paste the Google Calendar embed URL (iframe src). Get it from Google Calendar → Settings → Integrate calendar → Public URL
              </p>
              <Input
                id="googleCalendar"
                value={googleCalendarUrl}
                onChange={(e) => setGoogleCalendarUrl(e.target.value)}
                placeholder="https://calendar.google.com/calendar/embed?src=..."
              />
            </div>
            <Button onClick={handleSaveGoogleCalendar} disabled={savingCalendar}>
              {savingCalendar ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Google Calendar Link
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {events.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{event.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(event.start_date).toLocaleDateString()}
                    {event.end_date && ` - ${new Date(event.end_date).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setEditingEvent(event);
                      setImageUrl(event.image_url || "");
                      setOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(event.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{event.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectingImage && (
        <ImageSelector
          onSelect={handleImageSelect}
          onClose={() => setSelectingImage(false)}
        />
      )}
    </div>
  );
};

export default EventsManagement;
