import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Vault, Coins, ArrowUpRight, ArrowDownLeft, Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface StakeVaultProps {
  totalStaked: number;
  totalMembers: number;
  stakePerMember: number;
  currency: string;
  lockedAmount: number;
  releasedAmount: number;
}

export function StakeVault({ 
  totalStaked, 
  totalMembers, 
  stakePerMember, 
  currency,
  lockedAmount,
  releasedAmount
}: StakeVaultProps) {
  const lockedPercentage = (lockedAmount / totalStaked) * 100;
  
  const handleJoin = () => {
    toast({
      title: 'Wallet Action Required',
      description: `Confirm stake deposit of ${stakePerMember} ${currency} in your wallet.`,
    });
  };

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Vault className="h-4 w-4 text-primary" />
          Stake Vault
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Staked</span>
            <div className="flex items-center gap-1">
              <Coins className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold font-mono">{totalStaked}</span>
              <span className="text-muted-foreground">{currency}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {totalMembers} members × {stakePerMember} {currency}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-warning" />
              <span>Locked</span>
            </div>
            <span className="font-mono">{lockedAmount} {currency}</span>
          </div>
          
          <Progress value={lockedPercentage} className="h-2" />
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <ArrowDownLeft className="h-4 w-4 text-success" />
              <span>Released</span>
            </div>
            <span className="font-mono text-success">{releasedAmount} {currency}</span>
          </div>
        </div>

        <div className="pt-2 space-y-2">
          <Button onClick={handleJoin} variant="cyber" className="w-full">
            <ArrowUpRight className="h-4 w-4 mr-2" />
            Join & Stake {stakePerMember} {currency}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
