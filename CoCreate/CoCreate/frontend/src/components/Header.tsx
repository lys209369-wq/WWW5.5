import { Link } from 'react-router-dom';
import { WalletButton } from './WalletButton';
import { Hexagon } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Hexagon className="h-8 w-8 text-primary animate-pulse-slow" />
            <Hexagon className="h-8 w-8 text-secondary absolute top-0 left-0 opacity-50 rotate-30" />
          </div>
          <span className="text-xl font-bold text-gradient">Cocreate</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/" 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
          <Link 
            to="/create" 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Create Project
          </Link>
        </nav>

        <WalletButton />
      </div>
    </header>
  );
}
