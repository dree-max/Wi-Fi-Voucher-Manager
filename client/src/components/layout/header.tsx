import { useState } from "react";
import { Bell, Moon, Sun, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  subtitle: string;
  onPageChange?: (title: string, subtitle: string) => void;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1 lg:ml-0 ml-12">
          <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 truncate">{title}</h2>
          <p className="text-sm text-gray-500 hidden sm:block">{subtitle}</p>
        </div>
        <div className="flex items-center space-x-2 lg:space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-gray-400 hover:text-gray-600"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-gray-600"
          >
            <Bell size={18} />
          </Button>
          <div className="relative hidden md:block">
            <Input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-48 lg:w-64"
            />
            <Search 
              size={16} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>
          {/* Mobile search button */}
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-gray-600 md:hidden"
          >
            <Search size={18} />
          </Button>
        </div>
      </div>
    </header>
  );
}
