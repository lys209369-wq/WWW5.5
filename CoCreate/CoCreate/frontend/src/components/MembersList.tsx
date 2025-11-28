import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, CheckCircle2, Coins } from 'lucide-react';
import { Member } from '@/lib/mockData';

interface MembersListProps {
  members: Member[];
}

export function MembersList({ members }: MembersListProps) {
  const statusConfig = {
    staked: { label: 'Staked', className: 'bg-success/20 text-success border-success/30' },
    pending: { label: 'Pending', className: 'bg-warning/20 text-warning border-warning/30' },
    returned: { label: 'Returned', className: 'bg-secondary/20 text-secondary border-secondary/30' },
    slashed: { label: 'Slashed', className: 'bg-destructive/20 text-destructive border-destructive/30' },
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4 text-primary" />
          Team Members ({members.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {members.map((member) => {
            const config = statusConfig[member.stakeStatus];
            
            return (
              <div 
                key={member.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback>{member.displayName.slice(0, 2)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{member.displayName}</span>
                    <Badge variant="outline" className={`text-xs ${config.className}`}>
                      {config.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {member.tasksCompleted} tasks
                    </span>
                    <span className="flex items-center gap-1">
                      <Coins className="h-3 w-3" />
                      {member.stakeAmount} ETH
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
