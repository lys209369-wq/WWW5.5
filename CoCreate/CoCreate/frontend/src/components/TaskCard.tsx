import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Upload, 
  CheckCircle2, 
  XCircle, 
  Eye,
  ExternalLink,
  Coins
} from 'lucide-react';
import { Task } from '@/lib/mockData';
import { SubmitProofDialog } from './SubmitProofDialog';
import { ReviewTaskDialog } from './ReviewTaskDialog';

interface TaskCardProps {
  task: Task;
  isOwner?: boolean;
  onStatusChange?: (taskId: string, status: Task['status']) => void;
}

export function TaskCard({ task, isOwner = false, onStatusChange }: TaskCardProps) {
  const [submitOpen, setSubmitOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  const statusConfig = {
    pending: { 
      label: 'Pending', 
      icon: Clock, 
      className: 'bg-muted text-muted-foreground border-muted' 
    },
    submitted: { 
      label: 'Submitted', 
      icon: Upload, 
      className: 'bg-warning/20 text-warning border-warning/30' 
    },
    under_review: { 
      label: 'Under Review', 
      icon: Eye, 
      className: 'bg-primary/20 text-primary border-primary/30' 
    },
    approved: { 
      label: 'Approved', 
      icon: CheckCircle2, 
      className: 'bg-success/20 text-success border-success/30' 
    },
    rejected: { 
      label: 'Rejected', 
      icon: XCircle, 
      className: 'bg-destructive/20 text-destructive border-destructive/30' 
    },
  };

  const config = statusConfig[task.status];
  const StatusIcon = config.icon;

  return (
    <>
      <Card className="group hover:border-border transition-all duration-200">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{task.title}</h4>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {task.description}
              </p>
            </div>
            <Badge variant="outline" className={config.className}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Assignee</span>
            <span className="font-mono text-primary">{task.assignee}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Reward</span>
            <div className="flex items-center gap-1">
              <Coins className="h-3.5 w-3.5 text-primary" />
              <span className="font-mono">{task.reward} ETH</span>
            </div>
          </div>

          {task.proofCid && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Proof</span>
              <a 
                href={`https://ipfs.io/ipfs/${task.proofCid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline font-mono text-xs"
              >
                {task.proofCid.slice(0, 12)}...
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {task.status === 'pending' && !isOwner && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => setSubmitOpen(true)}
              >
                <Upload className="h-4 w-4 mr-1" />
                Submit Proof
              </Button>
            )}
            
            {(task.status === 'submitted' || task.status === 'under_review') && isOwner && (
              <Button 
                variant="default" 
                size="sm" 
                className="flex-1"
                onClick={() => setReviewOpen(true)}
              >
                <Eye className="h-4 w-4 mr-1" />
                Review
              </Button>
            )}

            {task.status === 'approved' && (
              <div className="flex items-center gap-2 text-success text-sm">
                <CheckCircle2 className="h-4 w-4" />
                <span>NFT Minted</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <SubmitProofDialog 
        open={submitOpen} 
        onOpenChange={setSubmitOpen}
        task={task}
        onSubmit={() => {
          onStatusChange?.(task.id, 'submitted');
          setSubmitOpen(false);
        }}
      />

      <ReviewTaskDialog
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        task={task}
        onApprove={() => {
          onStatusChange?.(task.id, 'approved');
          setReviewOpen(false);
        }}
        onReject={() => {
          onStatusChange?.(task.id, 'rejected');
          setReviewOpen(false);
        }}
      />
    </>
  );
}
