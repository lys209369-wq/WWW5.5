import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Hexagon, Loader2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const CreateProject = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [stakeAmount, setStakeAmount] = useState('0.1');
  const [creating, setCreating] = useState(false);
  const [step, setStep] = useState<'form' | 'signing' | 'complete'>('form');

  const handleCreate = async () => {
    if (!name || !description || !stakeAmount) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setStep('signing');
    setCreating(true);

    // Simulate wallet signing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate transaction
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setStep('complete');
    setCreating(false);

    toast({
      title: 'Project Created!',
      description: 'Your project is now live on-chain.',
    });

    setTimeout(() => {
      navigate('/project/proj_001');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>

        <Card className="border-primary/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Hexagon className="h-10 w-10 text-primary" />
              </div>
              <div>
                <CardTitle>Create New Project</CardTitle>
                <CardDescription>
                  Set up a stake-backed collaboration project
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {step === 'form' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., DeFi Dashboard Hackathon"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your project goals and deliverables..."
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stake">Stake Amount (ETH) *</Label>
                  <Input
                    id="stake"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.1"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Each team member must stake this amount to join
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <h4 className="font-medium mb-2">What happens next?</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• A project contract will be deployed on-chain</li>
                    <li>• You'll be set as the project owner</li>
                    <li>• Team members can join by staking {stakeAmount || '0.1'} ETH</li>
                    <li>• Create tasks and review submissions</li>
                  </ul>
                </div>

                <Button
                  onClick={handleCreate}
                  variant="cyber"
                  className="w-full"
                  disabled={creating}
                >
                  Create Project On-Chain
                </Button>
              </div>
            )}

            {step === 'signing' && (
              <div className="text-center py-12">
                <Loader2 className="h-16 w-16 mx-auto text-primary animate-spin mb-6" />
                <h3 className="text-xl font-semibold mb-2">Creating Project</h3>
                <p className="text-muted-foreground">
                  Please confirm the transaction in your wallet...
                </p>
              </div>
            )}

            {step === 'complete' && (
              <div className="text-center py-12">
                <CheckCircle2 className="h-16 w-16 mx-auto text-success mb-6" />
                <h3 className="text-xl font-semibold text-success mb-2">
                  Project Created!
                </h3>
                <p className="text-muted-foreground">
                  Redirecting to your project dashboard...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateProject;
