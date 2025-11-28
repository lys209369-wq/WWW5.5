import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Coins, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface JoinProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  stakeAmount: number;
  currency: string;
  onJoin: () => void;
}

export function JoinProjectDialog({
  open,
  onOpenChange,
  projectName,
  stakeAmount,
  currency,
  onJoin,
}: JoinProjectDialogProps) {
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<'confirm' | 'signing' | 'complete'>('confirm');

  const handleJoin = async () => {
    setStep('signing');
    setProcessing(true);

    // Simulate wallet signing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate transaction
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setStep('complete');
    setProcessing(false);

    toast({
      title: 'Successfully Joined!',
      description: `You've staked ${stakeAmount} ${currency} and joined the project.`,
    });

    setTimeout(() => {
      onJoin();
      setStep('confirm');
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join Project</DialogTitle>
          <DialogDescription>
            Stake your commitment to join "{projectName}"
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {step === 'confirm' && (
            <div className="space-y-4">
              <div className="p-6 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 text-center">
                <Coins className="h-12 w-12 mx-auto text-primary mb-3" />
                <p className="text-3xl font-bold font-mono">
                  {stakeAmount} {currency}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Required Stake</p>
              </div>

              <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-warning">Stake Terms</p>
                  <p className="text-muted-foreground">
                    Your stake will be returned upon successful task completion. 
                    Failure to deliver may result in stake forfeiture.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 'signing' && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin mb-4" />
              <p className="font-medium">Confirming Transaction</p>
              <p className="text-sm text-muted-foreground mt-1">
                Please confirm in your wallet...
              </p>
            </div>
          )}

          {step === 'complete' && (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 mx-auto text-success mb-4" />
              <p className="font-medium text-success">Successfully Joined!</p>
              <p className="text-sm text-muted-foreground mt-1">
                You're now a team member
              </p>
            </div>
          )}
        </div>

        {step === 'confirm' && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleJoin} variant="cyber" disabled={processing}>
              Stake & Join
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
