import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Branch } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { School, Book, Video, Monitor, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const [, setLocation] = useLocation();
  
  // Fetch all branches
  const { data: branches = [], isLoading } = useQuery<Branch[]>({
    queryKey: ["/api/branches"],
  });
  
  // Get active branch
  const activeBranch = branches.find(branch => branch.isActive);
  
  // Redirect to active branch if it exists
  useEffect(() => {
    if (activeBranch && window.location.pathname === '/') {
      setLocation(`/branch/${activeBranch.code}`);
    }
  }, [activeBranch, setLocation]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center md:text-left md:flex md:items-center md:justify-between">
              <div className="md:max-w-2xl">
                <h1 className="text-4xl font-bold mb-4">EduStream — Video Lectures for B.Tech Students</h1>
                <p className="text-lg mb-8 text-blue-100">
                  A centralized platform for accessing curated, semester-wise video lectures for your engineering studies
                </p>
                {activeBranch && (
                  <Button 
                    size="lg" 
                    className="bg-white text-blue-600 hover:bg-blue-50"
                    onClick={() => setLocation(`/branch/${activeBranch.code}`)}
                  >
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="hidden md:block">
                <Monitor className="h-48 w-48 text-blue-200" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why EduStream?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Book className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Organized Content</h3>
                <p className="text-gray-600">
                  Find all your subject videos neatly organized by branch and semester
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Video className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Curated Quality</h3>
                <p className="text-gray-600">
                  Access only high-quality video lectures from trusted educational sources
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <School className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Expert Educators</h3>
                <p className="text-gray-600">
                  Learn from experienced professors and industry professionals
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Available Branches */}
        <div className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Available Branches</h2>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-32 bg-white rounded-lg shadow animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {branches.map(branch => (
                  <Card 
                    key={branch.id}
                    className={`transition-all ${branch.isActive ? 'cursor-pointer hover:shadow-md' : 'opacity-70'}`}
                    onClick={() => branch.isActive && setLocation(`/branch/${branch.code}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-xl font-semibold">{branch.code}</h3>
                          <p className="text-gray-600">{branch.name}</p>
                        </div>
                        {branch.isActive ? (
                          <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-medium">
                            Available
                          </div>
                        ) : (
                          <div className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                            Coming Soon
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
