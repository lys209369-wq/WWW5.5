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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  FileText,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { Task } from '@/lib/mockData';
import { toast } from '@/hooks/use-toast';

interface ReviewTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  onApprove: () => void;
  onReject: () => void;
}

export function ReviewTaskDialog({ 
  open, 
  onOpenChange, 
  task, 
  onApprove, 
  onReject 
}: ReviewTaskDialogProps) {
  const [feedback, setFeedback] = useState('');
  const [processing, setProcessing] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  const handleApprove = async () => {
    setAction('approve');
    setProcessing(true);
    
    // Simulate on-chain transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: 'Task Approved',
      description: 'Contribution NFT minted and stake unlocked for contributor.',
    });
    
    setProcessing(false);
    onApprove();
  };

  const handleReject = async () => {
    setAction('reject');
    setProcessing(true);
    
    // Simulate on-chain transaction
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: 'Task Rejected',
      description: 'Contributor stake remains frozen. They can resubmit.',
      variant: 'destructive',
    });
    
    setProcessing(false);
    onReject();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Review Submission</DialogTitle>
          <DialogDescription>
            Review the proof submitted for "{task.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Task</span>
              <span className="font-medium">{task.title}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Assignee</span>
              <span className="font-mono text-primary">{task.assignee}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Reward</span>
              <span className="font-mono">{task.reward} ETH</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Submitted Proof</Label>
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Proof Document</p>
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    {task.proofCid || 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco'}
                  </p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <a 
                    href={`https://ipfs.io/ipfs/${task.proofCid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Feedback (optional)</Label>
            <Textarea
              placeholder="Add feedback for the contributor..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>

          <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-warning">On-chain Action</p>
              <p className="text-muted-foreground">
                Approving will mint an NFT and return stake. Rejecting keeps stake frozen.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button 
            variant="destructive" 
            onClick={handleReject}
            disabled={processing}
            className="flex-1"
          >
            {processing && action === 'reject' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4 mr-2" />
            )}
            Reject
          </Button>
          <Button 
            variant="success" 
            onClick={handleApprove}
            disabled={processing}
            className="flex-1"
          >
            {processing && action === 'approve' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            Approve & Mint NFT
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
