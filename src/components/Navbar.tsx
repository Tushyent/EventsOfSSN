import Link from 'next/link';
import { Calendar, User, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-md supports-[backdrop-filter]:bg-black/20">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center transition-transform group-hover:scale-110">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            EventsOfSSN
          </span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/events" className="text-sm text-gray-300 hover:text-white transition-colors">
            Discover
          </Link>
          <Link href="/clubs" className="text-sm text-gray-300 hover:text-white transition-colors">
            Clubs
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
            <Search className="w-4 h-4" />
          </Button>
          <Button className="hidden md:flex bg-white text-black hover:bg-gray-200 rounded-full px-6 font-medium transition-all hover:scale-105">
            Sign In
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden text-gray-300 hover:text-white">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
