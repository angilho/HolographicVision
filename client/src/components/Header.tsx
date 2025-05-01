import React from 'react';
import { Link } from 'wouter';
import { Box } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <Box className="text-accent w-6 h-6" />
              <h1 className="text-xl font-bold text-dark">Hologram Creator</h1>
            </div>
          </Link>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link href="/" className="text-gray-600 hover:text-primary font-medium">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-gray-600 hover:text-primary font-medium">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-gray-600 hover:text-primary font-medium">
                  Help
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
