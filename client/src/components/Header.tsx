import { useState } from "react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { School, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onSearch?: (searchTerm: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };
  
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center cursor-pointer">
            <School className="h-6 w-6 text-primary mr-2" />
            <h1 className="text-xl font-bold text-primary">EduStream</h1>
          </div>
        </Link>
        
        <div className="flex items-center space-x-4">
          {/* SearchBar */}
          <div className="relative hidden md:block">
            <Input
              type="text"
              placeholder="Search subjects, topics..."
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-64"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Search className="h-4 w-4 absolute right-3 top-3 text-gray-400" />
          </div>
          
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5 text-gray-700" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5 text-gray-700" />
          </Button>
        </div>
      </div>
    </header>
  );
}
