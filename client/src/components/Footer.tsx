import { School } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <Link href="/">
            <div className="flex items-center mb-4 md:mb-0 cursor-pointer">
              <School className="h-5 w-5 text-primary mr-2" />
              <span className="font-semibold">JIT LECTURES LIBRARY</span>
            </div>
          </Link>
          <div className="text-sm text-gray-500">
            CREATED BY PARTH,KSHITIJ,KUNAL
          </div>
        </div>
      </div>
    </footer>
  );
}
