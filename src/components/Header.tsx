import React from 'react';
import { Train } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-gradient-primary text-primary-foreground shadow-primary">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-foreground/10 rounded-lg">
            <Train className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Störningskollen</h1>
            <p className="text-primary-foreground/80 text-sm">Din personliga reseassistent vid strul</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;