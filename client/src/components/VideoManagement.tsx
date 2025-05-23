import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Plus, 
  Edit2,
  Trash2,
  Film,
  X
} from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { Video, Lecturer, Subject } from "@/lib/types";

// Form validation schema
const videoSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  youtubeId: z.string().min(5, "Valid YouTube ID required"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 second"),
  lecturerId: z.coerce.number().int().positive("Please select a lecturer"),
  subjectId: z.coerce.number().int(),
});

type VideoFormValues = z.infer<typeof videoSchema>;

interface VideoManagementProps {
  subjectId: number;
  onVideoAdded?: () => void;
  selectedVideo?: (Video & { lecturer: Lecturer }) | null;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Export the component and expose the edit and delete handlers
export function VideoManagement({ 
  subjectId, 
  onVideoAdded, 
  selectedVideo, 
  isOpen: externalIsOpen, 
  onOpenChange 
}: VideoManagementProps) {
  const { isProfessor, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Use the externally provided selectedVideo or internal state
  const [internalSelectedVideo, setInternalSelectedVideo] = useState<(Video & { lecturer: Lecturer }) | null>(null);
  
  // Handle external isOpen state if provided
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // Combine internal and external state
  const currentSelectedVideo = selectedVideo || internalSelectedVideo;
  
  // Handle the external open state if provided
  useEffect(() => {
    if (externalIsOpen !== undefined) {
      if (externalIsOpen) {
        // If external state wants dialog open and we have a selectedVideo
        if (selectedVideo) {
          // Check what action to perform based on the stored action type
          const videoAction = sessionStorage.getItem('videoAction');
          
          if (videoAction === 'delete') {
            setIsDeleteDialogOpen(true);
          } else {
            // Default to edit if no action is specified or if it's 'edit'
            setIsEditDialogOpen(true);
          }
        } else {
          // Otherwise open add dialog
          setIsAddDialogOpen(true);
        }
      } else {
        // If external state wants dialogs closed
        setIsAddDialogOpen(false);
        setIsEditDialogOpen(false);
        setIsDeleteDialogOpen(false);
        // Clear the action type when closing dialogs
        sessionStorage.removeItem('videoAction');
      }
    }
  }, [externalIsOpen, selectedVideo]);
  
  // If not a professor, don't render the component
  if (!isProfessor) return null;
  
  // Fetch videos for this subject
  const { data: videos = [], isLoading: isLoadingVideos } = useQuery<(Video & { lecturer: Lecturer })[]>({
    queryKey: ["/api/subjects", subjectId, "videos"],
    enabled: Boolean(subjectId && isProfessor),
  });
  
  // Fetch all lecturers
  const { data: lecturers = [] } = useQuery<Lecturer[]>({
    queryKey: ["/api/lecturers"],
    enabled: Boolean(isProfessor),
  });
  
  // Get current subject info
  const { data: subject } = useQuery<Subject>({
    queryKey: ["/api/subjects", subjectId],
    enabled: Boolean(subjectId && isProfessor),
  });
  
  // Form for adding/editing videos
  const form = useForm<VideoFormValues>({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      title: "",
      description: "",
      youtubeId: "",
      duration: 0,
      lecturerId: 0,
      subjectId: subjectId,
    },
  });
  
  // Reset form when dialog opens/closes
  const resetForm = (video?: Video & { lecturer: Lecturer }) => {
    if (video) {
      form.reset({
        title: video.title,
        description: video.description || "",
        youtubeId: video.youtubeId,
        duration: video.duration,
        lecturerId: video.lecturerId,
        subjectId: video.subjectId,
      });
    } else {
      form.reset({
        title: "",
        description: "",
        youtubeId: "",
        duration: 0,
        lecturerId: 0,
        subjectId: subjectId,
      });
    }
  };
  
  // Add video mutation
  const addVideoMutation = useMutation({
    mutationFn: async (data: VideoFormValues) => {
      // Get userId from localStorage
      const userId = localStorage.getItem('userId');
      
      return await apiRequest<Video>({
        url: `/api/videos?userId=${userId}`,
        method: "POST",
        data: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Video added successfully",
      });
      // Close dialog and reset form
      setIsAddDialogOpen(false);
      resetForm();
      // Refresh videos list
      queryClient.invalidateQueries({ queryKey: ["/api/subjects", subjectId, "videos"] });
      if (onVideoAdded) onVideoAdded();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add video",
        variant: "destructive",
      });
    },
  });
  
  // Edit video mutation
  const editVideoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: VideoFormValues }) => {
      // Get userId from localStorage
      const userId = localStorage.getItem('userId');
      
      return await apiRequest<Video>({
        url: `/api/videos/${id}?userId=${userId}`,
        method: "PATCH",
        data: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Video updated successfully",
      });
      // Close dialog and reset form
      setIsEditDialogOpen(false);
      setInternalSelectedVideo(null);
      // Notify parent of state change if callback exists
      if (onOpenChange) onOpenChange(false);
      // Refresh videos list
      queryClient.invalidateQueries({ queryKey: ["/api/subjects", subjectId, "videos"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update video",
        variant: "destructive",
      });
    },
  });
  
  // Delete video mutation
  const deleteVideoMutation = useMutation({
    mutationFn: async (id: number) => {
      // Get userId from localStorage
      const userId = localStorage.getItem('userId');
      
      return await apiRequest({
        url: `/api/videos/${id}?userId=${userId}`,
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Video deleted successfully",
      });
      // Close dialog
      setIsDeleteDialogOpen(false);
      setInternalSelectedVideo(null);
      // Notify parent of state change if callback exists
      if (onOpenChange) onOpenChange(false);
      // Refresh videos list
      queryClient.invalidateQueries({ queryKey: ["/api/subjects", subjectId, "videos"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete video",
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (values: VideoFormValues) => {
    if (isEditDialogOpen && currentSelectedVideo) {
      editVideoMutation.mutate({ id: currentSelectedVideo.id, data: values });
    } else {
      addVideoMutation.mutate(values);
    }
  };
  
  // Handle edit button click
  const handleEditClick = (video: Video & { lecturer: Lecturer }) => {
    setInternalSelectedVideo(video);
    resetForm(video);
    setIsEditDialogOpen(true);
    // Notify parent of state change if callback exists
    if (onOpenChange) onOpenChange(true);
  };
  
  // Handle delete button click
  const handleDeleteClick = (video: Video & { lecturer: Lecturer }) => {
    setInternalSelectedVideo(video);
    setIsDeleteDialogOpen(true);
    // Notify parent of state change if callback exists
    if (onOpenChange) onOpenChange(true);
  };
  
  // Parse YouTube ID from URL
  const handleYouTubeUrlChange = (url: string) => {
    if (!url) return;
    
    try {
      // Handle different YouTube URL formats
      let videoId = url;
      
      if (url.includes('youtube.com/watch?v=')) {
        const urlObj = new URL(url);
        videoId = urlObj.searchParams.get('v') || '';
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      }
      
      if (videoId) {
        form.setValue('youtubeId', videoId);
      }
    } catch (error) {
      // If not a valid URL, assume it's a direct video ID
      console.log('Using input as direct YouTube ID');
    }
  };
  
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        
        <Button 
          onClick={() => {
            resetForm();
            setIsAddDialogOpen(true);
          }}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Video
        </Button>
      </div>
      
      {/* Videos List for Management */}
      {isLoadingVideos ? (
        <div className="text-center py-4">Loading videos...</div>
      ) : videos.length > 0 ? (
        <div className="space-y-3">
          {videos.map(video => (
            <div 
              key={video.id}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <h4 className="font-medium">{video.title}</h4>
                <div className="text-sm text-gray-500 flex items-center mt-1">
                  <span className="mr-3">Duration: {formatDuration(video.duration)}</span>
                
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditClick(video)}
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 border-red-200 hover:bg-red-50"
                  onClick={() => handleDeleteClick(video)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No more videos found for this subject. Add your more videos!</p>
        </div>
      )}
      
      {/* Add/Edit Video Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setIsEditDialogOpen(false);
        }
      }}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {isEditDialogOpen ? "Edit Video" : "Add New Video"}
            </DialogTitle>
            <DialogDescription>
              {isEditDialogOpen 
                ? "Update the video information below" 
                : "Fill in the details to add a new video to this subject"}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Video title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief description of the video"
                        className="resize-none" 
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="youtubeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>YouTube URL or ID</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="YouTube URL or video ID" 
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleYouTubeUrlChange(e.target.value);
                        }} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (seconds)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min="1"
                        placeholder="Video duration in seconds" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lecturerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lecturer</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value.toString()}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a lecturer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {lecturers.map(lecturer => (
                          <SelectItem 
                            key={lecturer.id} 
                            value={lecturer.id.toString()}
                          >
                            {lecturer.name} - {lecturer.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="subjectId"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input type="hidden" {...field} value={subjectId} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  type="submit"
                  disabled={addVideoMutation.isPending || editVideoMutation.isPending}
                >
                  {addVideoMutation.isPending || editVideoMutation.isPending
                    ? "Saving..."
                    : isEditDialogOpen ? "Update Video" : "Add Video"
                  }
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the video "{currentSelectedVideo?.title}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => currentSelectedVideo && deleteVideoMutation.mutate(currentSelectedVideo.id)}
              className="bg-red-500 hover:bg-red-600"
              disabled={deleteVideoMutation.isPending}
            >
              {deleteVideoMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}