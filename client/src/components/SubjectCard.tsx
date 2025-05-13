import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Play } from "lucide-react";
import { Lecturer, Subject, Video } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface SubjectCardProps {
  subject: Subject;
  onVideoSelect: (video: Video & { lecturer: Lecturer }) => void;
}

export function SubjectCard({ subject, onVideoSelect }: SubjectCardProps) {
  // Fetch videos for this subject
  const { data: videos = [], isLoading } = useQuery<(Video & { lecturer: Lecturer })[]>({
    queryKey: ["/api/subjects", subject.id, "videos"],
  });
  
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
                  className="video-preview bg-gray-100 rounded-lg p-3 hover:bg-gray-200 cursor-pointer transition"
                  onClick={() => onVideoSelect(video)}
                >
                  <div className="flex items-center">
                    <Play className="text-primary mr-2 h-5 w-5" />
                    <div>
                      <p className="font-medium text-sm">{video.title}</p>
                      <p className="text-xs text-gray-500">{formatDuration(video.duration)}</p>
                    </div>
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
      </CardContent>
    </Card>
  );
}
