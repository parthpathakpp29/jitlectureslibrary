import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Play } from "lucide-react";
import { formatDuration, formatDate } from "@/lib/utils";
import { Video, Lecturer } from "@/lib/types";

interface VideoModalProps {
  video?: (Video & { lecturer: Lecturer }) | null;
  isOpen: boolean;
  onClose: () => void;
  relatedVideos?: (Video & { lecturer: Lecturer })[];
  onVideoSelect: (video: Video & { lecturer: Lecturer }) => void;
}

export function VideoModal({ 
  video, 
  isOpen, 
  onClose, 
  relatedVideos = [],
  onVideoSelect 
}: VideoModalProps) {
  if (!video) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-4 border-b flex justify-between items-center">
          <DialogTitle className="text-lg">{video.title}</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>
        
        <div className="p-4">
          <div className="video-container mb-4 relative pt-[56.25%]">
            <iframe 
              src={`https://www.youtube.com/embed/${video.youtubeId}`}
              title={video.title}
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          
          <div className="flex items-center mb-4">
            <img 
              src={video.lecturer.imageUrl || "https://via.placeholder.com/40"}
              alt={video.lecturer.name}
              className="w-12 h-12 rounded-full mr-4 object-cover"
            />
            <div>
              <p className="font-medium">{video.lecturer.name}</p>
              <p className="text-gray-500 text-sm">{video.lecturer.title}, {video.lecturer.institution}</p>
              <p className="text-sm text-gray-600 mt-1">
                Published: {video.publishedAt ? formatDate(video.publishedAt) : 'Unknown'} • {formatDuration(video.duration)}
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-gray-700 text-sm mb-4">
              {video.description || 'No description available.'}
            </p>
            
            {relatedVideos.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-2">Recommended Videos</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {relatedVideos.filter(v => v.id !== video.id).slice(0, 2).map(relatedVideo => (
                    <div 
                      key={relatedVideo.id}
                      className="bg-gray-100 rounded-lg p-3 hover:bg-gray-200 cursor-pointer transition"
                      onClick={() => onVideoSelect(relatedVideo)}
                    >
                      <div className="flex items-center">
                        <Play className="text-primary mr-2 h-5 w-5" />
                        <div>
                          <p className="font-medium text-sm">{relatedVideo.title}</p>
                          <p className="text-xs text-gray-500">{formatDuration(relatedVideo.duration)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
