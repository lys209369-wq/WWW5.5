import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, CheckCircle2, Coins, ArrowRight } from 'lucide-react';
import { Project } from '@/lib/mockData';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const progress = (project.completedTasks / project.tasksCount) * 100;

  const statusColors = {
    active: 'bg-success/20 text-success border-success/30',
    completed: 'bg-secondary/20 text-secondary border-secondary/30',
    pending: 'bg-warning/20 text-warning border-warning/30',
  };

  return (
    <Link to={`/project/${project.id}`}>
      <Card className="group hover:border-primary/50 transition-all duration-300 hover:glow-primary cursor-pointer bg-gradient-to-b from-card to-background">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors truncate">
                {project.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {project.description}
              </p>
            </div>
            <Badge variant="outline" className={statusColors[project.status]}>
              {project.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{project.membersCount} members</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
              <span>{project.completedTasks}/{project.tasksCount} tasks</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-primary font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-1.5">
              <Coins className="h-4 w-4 text-primary" />
              <span className="font-mono text-sm">
                {project.stakeAmount} {project.currency}
              </span>
              <span className="text-xs text-muted-foreground">stake</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
