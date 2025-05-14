import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { School, Search, User, LogOut, LogIn, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onSearch?: (searchTerm: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isProfessor, logout } = useAuth();
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };
  
  const handleLogout = () => {
    logout();
    setLocation("/");
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
          
          {/* User menu */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn(
                    "rounded-full",
                    isProfessor && "bg-primary/10"
                  )}
                >
                  {isProfessor ? (
                    <UserCog className="h-5 w-5 text-gray-700" />
                  ) : (
                    <User className="h-5 w-5 text-gray-700" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{user?.username}</span>
                    <span className="text-xs text-gray-500 capitalize">{user?.type}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLocation("/login")}
              className="flex items-center"
            >
              <LogIn className="mr-2 h-4 w-4" />
              <span>Login</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
