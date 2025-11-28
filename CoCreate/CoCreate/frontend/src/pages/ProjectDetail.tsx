import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { TaskCard } from '@/components/TaskCard';
import { MembersList } from '@/components/MembersList';
import { StakeVault } from '@/components/StakeVault';
import { OnChainLog } from '@/components/OnChainLog';
import { JoinProjectDialog } from '@/components/JoinProjectDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Plus, 
  Users, 
  CheckCircle2, 
  Clock,
  Hexagon,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { 
  mockProjects, 
  mockTasks, 
  mockMembers, 
  mockEvents,
  Task 
} from '@/lib/mockData';
import { toast } from '@/hooks/use-toast';

const ProjectDetail = () => {
  const { id } = useParams();
  const project = mockProjects.find((p) => p.id === id) || mockProjects[0];
  
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [joinOpen, setJoinOpen] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  
  const isOwner = true; // Mock: current user is owner

  const handleTaskStatusChange = (taskId: string, status: Task['status']) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
  };

  const handleFinalize = async () => {
    setFinalizing(true);
    
    // Simulate finalization
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    toast({
      title: 'Project Finalized',
      description: 'All stakes have been settled and NFTs minted.',
    });
    
    setFinalizing(false);
  };

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    submitted: tasks.filter((t) => ['submitted', 'under_review'].includes(t.status)).length,
    approved: tasks.filter((t) => t.status === 'approved').length,
    rejected: tasks.filter((t) => t.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-6">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Project Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Hexagon className="h-8 w-8 text-primary" />
                  <h1 className="text-2xl font-bold">{project.name}</h1>
                  <Badge 
                    variant="outline" 
                    className={
                      project.status === 'active' 
                        ? 'bg-success/20 text-success border-success/30' 
                        : 'bg-secondary/20 text-secondary border-secondary/30'
                    }
                  >
                    {project.status}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{project.description}</p>
              </div>
              
              <div className="flex gap-2">
                {isOwner && project.status === 'active' && (
                  <Button 
                    variant="destructive" 
                    onClick={handleFinalize}
                    disabled={finalizing}
                  >
                    {finalizing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Finalizing...
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Finalize Project
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">{stats.pending}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-warning" />
                    <span className="text-2xl font-bold">{stats.submitted}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">In Review</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-2xl font-bold">{stats.approved}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Approved</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <Hexagon className="h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold">{stats.total}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Total Tasks</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="tasks">
              <TabsList>
                <TabsTrigger value="tasks">Quest Board</TabsTrigger>
                <TabsTrigger value="members">Team</TabsTrigger>
                <TabsTrigger value="vault">Vault</TabsTrigger>
              </TabsList>

              <TabsContent value="tasks" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Tasks</h3>
                  {isOwner && (
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Task
                    </Button>
                  )}
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  {tasks.map((task) => (
                    <TaskCard 
                      key={task.id} 
                      task={task}
                      isOwner={isOwner}
                      onStatusChange={handleTaskStatusChange}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="members" className="mt-4">
                <MembersList members={mockMembers} />
                
                <Button 
                  variant="cyber" 
                  className="w-full mt-4"
                  onClick={() => setJoinOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Join This Project
                </Button>
              </TabsContent>

              <TabsContent value="vault" className="mt-4">
                <StakeVault
                  totalStaked={project.vaultBalance}
                  totalMembers={project.membersCount}
                  stakePerMember={project.stakeAmount}
                  currency={project.currency}
                  lockedAmount={0.3}
                  releasedAmount={0.2}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - On-Chain Log */}
          <div className="hidden lg:block">
            <OnChainLog events={mockEvents} />
          </div>
        </div>
      </div>

      <JoinProjectDialog
        open={joinOpen}
        onOpenChange={setJoinOpen}
        projectName={project.name}
        stakeAmount={project.stakeAmount}
        currency={project.currency}
        onJoin={() => {
          setJoinOpen(false);
        }}
      />
    </div>
  );
};

export default ProjectDetail;
