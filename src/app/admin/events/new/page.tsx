"use client";

import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, UploadCloud, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { createEventAction } from "@/actions/event";

export default function CreateEventPage() {
  const [date, setDate] = useState<Date>();
  const [deadline, setDeadline] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const formData = new FormData(e.currentTarget);
    if (date) formData.append("event_date", date.toISOString());
    if (deadline) formData.append("registration_deadline", deadline.toISOString());

    const result = await createEventAction(formData);
    
    if (result.error) {
      setMessage(`Error: ${result.error}`);
    } else {
      setMessage("Event submitted successfully! Waiting for Super Admin approval.");
      e.currentTarget.reset();
      setDate(undefined);
      setDeadline(undefined);
      setSelectedCategory("");
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
        Create New Event
      </h1>
      <p className="text-gray-400 mb-8">Submit your event details. All events must be approved before appearing on the feed.</p>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm">
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-200">Event Title</label>
          <Input name="title" required placeholder="e.g. HackSSN 2026" className="bg-black/50 border-white/20 text-white" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-200">Description</label>
          <Textarea name="description" required placeholder="Describe your event..." className="bg-black/50 border-white/20 min-h-[120px] text-white" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">Category</label>
            <Select name="category" required onValueChange={(val) => setSelectedCategory(val || "")} value={selectedCategory}>
              <SelectTrigger className="bg-black/50 border-white/20 text-white">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-black border-white/20 text-white">
                <SelectItem value="Tech Events">Tech Events</SelectItem>
                <SelectItem value="Non-Tech Events">Non-Tech Events</SelectItem>
                <SelectItem value="Workshops">Workshops</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedCategory === "Other" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">Custom Category</label>
              <Input name="custom_category" required placeholder="e.g. Guest Lecture" className="bg-black/50 border-white/20 text-white" />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">Venue / Location</label>
            <Input name="venue" required placeholder="e.g. Main Auditorium" className="bg-black/50 border-white/20 text-white" />
          </div>

          <div className="space-y-2 flex flex-col">
            <label className="text-sm font-medium text-gray-200">Event Start Date</label>
            <Popover>
              <PopoverTrigger render={<button type="button" className={buttonVariants({ variant: "outline", className: "w-full justify-start text-left font-normal bg-black/50 border-white/20 text-white hover:bg-white/10" })} />}>
                <div className="flex items-center">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-black border-white/20" align="start">
                <Calendar mode="single" selected={date} onSelect={setDate} className="text-white" />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">Event Time (Optional)</label>
            <Input name="event_time" placeholder="e.g. 9:00 AM - 5:00 PM" className="bg-black/50 border-white/20 text-white" />
          </div>

          <div className="space-y-2 flex flex-col">
            <label className="text-sm font-medium text-gray-200">Registration Deadline</label>
            <Popover>
              <PopoverTrigger render={<button type="button" className={buttonVariants({ variant: "outline", className: "w-full justify-start text-left font-normal bg-black/50 border-white/20 text-white hover:bg-white/10" })} />}>
                <div className="flex items-center">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, "PPP") : <span>Pick a deadline</span>}
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-black border-white/20" align="start">
                <Calendar mode="single" selected={deadline} onSelect={setDeadline} className="text-white" />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">Registration Fee (Optional)</label>
            <Input name="registration_fee" placeholder="e.g. Free, ₹200 per team" className="bg-black/50 border-white/20 text-white" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">Prize Pool (Optional)</label>
            <Input name="prize_pool" placeholder="e.g. ₹50,000 Total" className="bg-black/50 border-white/20 text-white" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">Coordinator Contact (Optional)</label>
            <Input name="coordinator_contact" placeholder="e.g. John Doe - 9876543210" className="bg-black/50 border-white/20 text-white" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-200">Event Poster</label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer bg-black/30 hover:bg-black/50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-8 h-8 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-gray-500">PNG, JPG, or WEBP (Max. 2MB)</p>
              </div>
              <Input name="poster" type="file" accept="image/*" required className="hidden" />
            </label>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-md text-sm font-medium ${message.includes("Error") ? "bg-red-500/20 text-red-200" : "bg-green-500/20 text-green-200"}`}>
            {message}
          </div>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full bg-white text-black hover:bg-gray-200 h-12 text-lg font-medium rounded-xl transition-transform hover:scale-[1.02]">
          {isSubmitting ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...</>
          ) : (
            "Submit Event for Approval"
          )}
        </Button>
      </form>
    </div>
  );
}
