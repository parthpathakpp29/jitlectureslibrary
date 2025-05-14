import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { SubjectCard } from "@/components/SubjectCard";
import { SubjectManagement } from "@/components/SubjectManagement";
import { VideoModal } from "@/components/VideoModal";
import { Footer } from "@/components/Footer";
import { Branch, Subject, Video, Lecturer } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useSearchFilter } from "@/hooks/useSearchFilter";
import { useAuth } from "@/hooks/useAuth";

export default function BranchView() {
  const { branchCode, semesterNumber = "3" } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<(Video & { lecturer: Lecturer }) | null>(null);
  const { isProfessor } = useAuth();
  
  // Fetch the branch by code
  const { data: branch, isLoading: isLoadingBranch } = useQuery<Branch>({
    queryKey: [`/api/branches/${branchCode}`],
    enabled: !!branchCode,
  });
  
  // Fetch semesters for this branch
  const { data: semesters = [] } = useQuery<any[]>({
    queryKey: [`/api/branches/${branch?.id}/semesters`],
    enabled: !!branch?.id,
  });
  
  // Find the current semester
  const currentSemester = semesters.find(s => s.number === parseInt(semesterNumber));
  
  // Fetch subjects for this branch and semester
  const { data: subjects = [], isLoading: isLoadingSubjects, refetch } = useQuery<Subject[]>({
    queryKey: ["/api/subjects", { branchId: branch?.id, semester: semesterNumber }],
    enabled: !!branch?.id,
  });
  
  // Apply search filter to subjects
  const filteredSubjects = useSearchFilter(subjects, searchTerm, ["name", "description"]);
  
  // Handle search input
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };
  
  // Select a video to play
  const handleVideoSelect = (video: Video & { lecturer: Lecturer }) => {
    setSelectedVideo(video);
  };
  
  // Close the video modal
  const handleCloseVideo = () => {
    setSelectedVideo(null);
  };
  
  // Get all videos for related videos section
  const { data: allVideos = [] } = useQuery<(Video & { lecturer: Lecturer })[]>({
    queryKey: ['/api/subjects', subjects?.[0]?.id, 'videos'],
    enabled: !!(subjects && subjects.length > 0),
  });
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header onSearch={handleSearch} />
      
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar 
          selectedBranch={branch}
          selectedSemester={parseInt(semesterNumber)}
        />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Mobile search */}
            <div className="md:hidden mb-6">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search subjects, topics..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-full"
                />
                <Search className="h-4 w-4 absolute right-3 top-3 text-gray-400" />
              </div>
            </div>
            
            {/* Current selection info */}
            <div className="mb-8">
              <div className="flex flex-wrap items-center text-sm text-gray-600 mb-2">
                <span>{branch?.code || 'Loading...'}</span>
                <span className="mx-2">›</span>
                <span>Semester {semesterNumber}</span>
              </div>
              <h1 className="text-2xl font-bold">
                {branch?.name || 'Loading...'} - Semester {semesterNumber}
              </h1>
              <p className="text-gray-600 mt-2">
                Find curated video lectures for all your {getOrdinal(parseInt(semesterNumber))} semester {branch?.code} subjects.
              </p>
            </div>

            {/* Subject Management for Professors */}
            {isProfessor && currentSemester && (
              <SubjectManagement 
                branchId={branch?.id || 0}
                semesterId={currentSemester.id}
                onSubjectAdded={() => refetch()}
              />
            )}
            
            {/* Subjects Grid */}
            {isLoadingSubjects ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-96 bg-gray-100 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : filteredSubjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSubjects.map((subject) => (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    onVideoSelect={handleVideoSelect}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">No subjects found matching your search criteria.</p>
                {searchTerm && (
                  <button 
                    className="mt-4 text-primary hover:underline"
                    onClick={() => setSearchTerm("")}
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
      
      <Footer />
      
      {/* Video Modal */}
      <VideoModal 
        video={selectedVideo}
        isOpen={!!selectedVideo}
        onClose={handleCloseVideo}
        relatedVideos={allVideos}
        onVideoSelect={handleVideoSelect}
      />
    </div>
  );
}

// Helper function to get ordinal suffix for numbers
function getOrdinal(n: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}
