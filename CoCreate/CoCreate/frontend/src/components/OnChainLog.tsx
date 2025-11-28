import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  Coins, 
  Upload, 
  CheckCircle2, 
  XCircle, 
  Hexagon,
  ArrowDownToLine,
  ExternalLink
} from 'lucide-react';
import { OnChainEvent } from '@/lib/mockData';

interface OnChainLogProps {
  events: OnChainEvent[];
}

export function OnChainLog({ events }: OnChainLogProps) {
  const eventConfig = {
    project_create: { icon: Hexagon, color: 'text-primary' },
    stake_deposit: { icon: Coins, color: 'text-success' },
    task_submit: { icon: Upload, color: 'text-warning' },
    task_approve: { icon: CheckCircle2, color: 'text-success' },
    task_reject: { icon: XCircle, color: 'text-destructive' },
    nft_mint: { icon: Hexagon, color: 'text-secondary' },
    stake_return: { icon: ArrowDownToLine, color: 'text-success' },
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4 text-primary" />
          On-Chain Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-280px)] px-4">
          <div className="space-y-3 pb-4">
            {events.map((event) => {
              const config = eventConfig[event.type];
              const Icon = config.icon;
              
              return (
                <div 
                  key={event.id} 
                  className="p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-md bg-background ${config.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-2">{event.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs font-mono">
                          {event.txHash}
                        </Badge>
                        <a 
                          href={`https://etherscan.io/tx/${event.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-primary" />
                        </a>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {event.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
