import React from 'react';
import { BookOpen } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-bible-900 text-white shadow-md">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-bible-800 rounded-lg">
            <BookOpen size={20} className="text-gold-400" />
          </div>
          <span className="font-serif font-bold text-lg tracking-wide">Pregador <span className="text-gold-400">Actual</span></span>
        </div>
      </div>
    </header>
  );
};