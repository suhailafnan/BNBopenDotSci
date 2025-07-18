// This is the footer for your application.

import { Github, Twitter, Send } from 'lucide-react';

export const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-gray-900 border-t border-gray-800 text-gray-400 py-8 px-4">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <p>&copy; {year} OpenDotSci. All rights reserved.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition"><Twitter /></a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition"><Github /></a>
          <a href="https://telegram.org" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition"><Send /></a>
        </div>
      </div>
    </footer>
  );
};
