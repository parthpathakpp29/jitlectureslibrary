import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Play } from "lucide-react";
import { Lecturer, Subject, Video } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { VideoManagement } from "@/components/VideoManagement";

// Define the type for video with lecturer info
type VideoWithLecturer = Video & { 
  lecturer: Lecturer 
};

interface SubjectCardProps {
  subject: Subject;
  onVideoSelect: (video: VideoWithLecturer) => void;
}

export function SubjectCard({ subject, onVideoSelect }: SubjectCardProps) {
  const { isProfessor } = useAuth();
  const [selectedVideo, setSelectedVideo] = useState<VideoWithLecturer | null>(null);
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const videoManagementRef = useRef<HTMLDivElement>(null);
  
  console.log(`SubjectCard rendering for subject ID: ${subject.id}`);
  
  // Fetch videos for this subject
  const { data: videos = [], isLoading, refetch, error } = useQuery<VideoWithLecturer[]>({
    queryKey: [`/api/subjects/${subject.id}/videos`]
  });
  
  // Log information about the query results
  console.log(`Subject ${subject.id} has ${videos.length} videos, isLoading: ${isLoading}, hasError: ${error ? 'yes' : 'no'}`);
  
  // If there's an error, log it for debugging
  if (error) {
    console.error(`Error fetching videos for subject ${subject.id}:`, error);
  }
  
  // Handlers for edit and delete operations
  const handleEditClick = (video: VideoWithLecturer) => {
    setSelectedVideo(video);
    setIsManagementOpen(true);
  };
  
  const handleDeleteClick = (video: VideoWithLecturer) => {
    setSelectedVideo(video);
    setIsManagementOpen(true);
  };
  
  if (isLoading) {
    return (
      <Card className="subject-card bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <CardContent className="p-5">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-4" />
          
          <div className="flex items-center mb-4">
            <Skeleton className="h-10 w-10 rounded-full mr-3" />
            <div>
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="subject-card bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-transform hover:translate-y-[-5px] hover:shadow-lg">
      <CardContent className="p-5">
        <h3 className="font-semibold text-lg mb-2">{subject.name}</h3>
        <p className="text-gray-600 text-sm mb-4">{subject.description}</p>
        
        {videos.length > 0 && (
          <>
            {/* Lecturer info */}
            <div className="flex items-center mb-4">
              <img 
                src={videos[0].lecturer.imageUrl || "https://via.placeholder.com/40"}
                alt={videos[0].lecturer.name}
                className="w-10 h-10 rounded-full mr-3 object-cover"
              />
              <div>
                <p className="font-medium text-sm">{videos[0].lecturer.name}</p>
                <p className="text-gray-500 text-xs">{videos[0].lecturer.title}, {videos[0].lecturer.institution}</p>
              </div>
            </div>
            
            {/* Video previews */}
            <div className="space-y-3">
              {videos.map(video => (
                <div 
                  key={video.id}
                  className="video-preview bg-gray-100 rounded-lg p-3 hover:bg-gray-200 transition"
                >
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex items-center flex-1 cursor-pointer" 
                      onClick={() => onVideoSelect(video)}
                    >
                      <Play className="text-primary mr-2 h-5 w-5" />
                      <div>
                        <p className="font-medium text-sm">{video.title}</p>
                        <p className="text-xs text-gray-500">{formatDuration(video.duration)}</p>
                      </div>
                    </div>
                    
                    {isProfessor && (
                      <div className="flex space-x-2">
                        <button 
                          className="text-blue-500 hover:text-blue-700 text-xs p-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(video);
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          className="text-red-500 hover:text-red-700 text-xs p-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(video);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        
        {videos.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No videos available for this subject yet.</p>
          </div>
        )}
        
        {/* Video Management for professors */}
        {isProfessor && (
          <div ref={videoManagementRef}>
            <VideoManagement 
              subjectId={subject.id} 
              onVideoAdded={() => refetch()}
              selectedVideo={selectedVideo}
              isOpen={isManagementOpen}
              onOpenChange={setIsManagementOpen}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
