import { Header } from '@/components/Header';
import { ProjectCard } from '@/components/ProjectCard';
import { Button } from '@/components/ui/button';
import { Plus, Hexagon, Users, Shield, Coins } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockProjects } from '@/lib/mockData';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Hexagon className="h-16 w-16 text-primary animate-pulse-slow" />
                <Hexagon className="h-16 w-16 text-secondary absolute top-0 left-0 opacity-50 rotate-30" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-gradient">Stake-Backed</span>
              <br />
              <span className="text-foreground">Web3 Collaboration</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Build trust through commitment. Every contribution is verified on-chain, 
              backed by stakes, and rewarded with proof-of-work NFTs.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/create">
                <Button variant="cyber" size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Project
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                Explore Projects
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors group">
              <Coins className="h-10 w-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-2">Stake-Backed Commitment</h3>
              <p className="text-sm text-muted-foreground">
                Members stake deposits to join. Complete tasks to get your stake back.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors group">
              <Shield className="h-10 w-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-2">Verifiable Proof</h3>
              <p className="text-sm text-muted-foreground">
                All submissions stored on IPFS. Contributions recorded on-chain forever.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors group">
              <Users className="h-10 w-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-2">NFT Reputation</h3>
              <p className="text-sm text-muted-foreground">
                Earn contribution NFTs for approved work. Build your on-chain reputation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Projects List */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Active Projects</h2>
              <p className="text-muted-foreground">Join a quest or create your own</p>
            </div>
            <Link to="/create">
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
