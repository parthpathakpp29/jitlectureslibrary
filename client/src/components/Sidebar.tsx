import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Branch, Semester } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SidebarProps {
  selectedBranch?: Branch;
  selectedSemester?: number;
}

export function Sidebar({ selectedBranch, selectedSemester }: SidebarProps) {
  const [location] = useLocation();
  
  // Fetch all branches
  const { data: branches = [], isLoading: isLoadingBranches } = useQuery<Branch[]>({
    queryKey: ["/api/branches"],
  });
  
  // Fetch semesters for the selected branch
  const { data: semesters = [] } = useQuery<Semester[]>({
    queryKey: ["/api/branches", selectedBranch?.id, "semesters"],
    enabled: !!selectedBranch?.id,
  });
  
  const semesterNumbers = Array.from({ length: 8 }, (_, i) => i + 1);
  
  return (
    <aside className="w-full md:w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4 sticky top-0">
        <h2 className="text-lg font-semibold mb-4">Select Branch</h2>
        
        {/* Branch Selection */}
        <div className="space-y-2 mb-6">
          {isLoadingBranches ? (
            <div className="animate-pulse space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 bg-gray-100 rounded-lg"></div>
              ))}
            </div>
          ) : (
            <>
              {branches.map((branch) => (
                <Link key={branch.id} href={branch.isActive ? `/branch/${branch.code}` : "#"}>
                  <div
                    className={cn(
                      "px-4 py-2 rounded-lg flex justify-between items-center",
                      branch.isActive 
                        ? "cursor-pointer hover:bg-gray-50" 
                        : "bg-gray-100 opacity-60 cursor-not-allowed",
                      selectedBranch?.id === branch.id && "bg-primary text-white"
                    )}
                  >
                    <span>{branch.code}</span>
                    {selectedBranch?.id === branch.id ? (
                      <Check className="h-4 w-4" />
                    ) : branch.comingSoon ? (
                      <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded">Coming Soon</span>
                    ) : null}
                  </div>
                </Link>
              ))}
            </>
          )}
        </div>
        
        <h2 className="text-lg font-semibold mb-4">Semester</h2>
        
        {/* Semester Selection */}
        <div className="grid grid-cols-4 gap-2">
          {semesterNumbers.map((num) => (
            <Link
              key={num}
              href={selectedBranch?.isActive ? `/branch/${selectedBranch.code}/semester/${num}` : "#"}
            >
              <div
                className={cn(
                  "semester-pill text-center py-2 rounded-lg cursor-pointer",
                  selectedSemester === num 
                    ? "bg-primary text-white" 
                    : "bg-gray-100 hover:bg-gray-200",
                  !selectedBranch?.isActive && "opacity-60 cursor-not-allowed"
                )}
              >
                {num}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
