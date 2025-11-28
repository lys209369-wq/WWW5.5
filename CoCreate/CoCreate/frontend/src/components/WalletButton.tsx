import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { currentUser } from '@/lib/mockData';

export function WalletButton() {
  const [isConnected, setIsConnected] = useState(currentUser.isConnected);

  const handleConnect = () => {
    // Mock wallet connection
    setTimeout(() => {
      setIsConnected(true);
      toast({
        title: 'Wallet Connected',
        description: `Connected as ${currentUser.displayName}`,
      });
    }, 500);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    toast({
      title: 'Wallet Disconnected',
      description: 'Your wallet has been disconnected.',
    });
  };

  const copyAddress = () => {
    navigator.clipboard.writeText('0x1234567890abcdef1234567890abcdef12345678');
    toast({
      title: 'Address Copied',
      description: 'Wallet address copied to clipboard.',
    });
  };

  if (!isConnected) {
    return (
      <Button onClick={handleConnect} variant="cyber" className="gap-2">
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <img
            src={currentUser.avatar}
            alt="Avatar"
            className="h-5 w-5 rounded-full"
          />
          <span className="font-mono">{currentUser.displayName}</span>
          <span className="text-muted-foreground text-xs">{currentUser.balance}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={copyAddress}>
          <Copy className="mr-2 h-4 w-4" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem>
          <ExternalLink className="mr-2 h-4 w-4" />
          View on Etherscan
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDisconnect} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
