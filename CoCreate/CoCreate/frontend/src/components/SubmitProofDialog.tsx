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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { Task } from '@/lib/mockData';
import { toast } from '@/hooks/use-toast';

interface SubmitProofDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  onSubmit: () => void;
}

export function SubmitProofDialog({ open, onOpenChange, task, onSubmit }: SubmitProofDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [cid, setCid] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    
    // Simulate IPFS upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockCid = 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setCid(mockCid);
    setUploading(false);
    setUploaded(true);
    
    toast({
      title: 'File Uploaded to IPFS',
      description: `CID: ${mockCid.slice(0, 20)}...`,
    });
  };

  const handleSubmit = async () => {
    setUploading(true);
    
    // Simulate on-chain transaction
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: 'Proof Submitted On-Chain',
      description: 'Transaction confirmed. Your submission is pending review.',
    });
    
    setUploading(false);
    onSubmit();
  };

  const resetState = () => {
    setFile(null);
    setNotes('');
    setUploading(false);
    setUploaded(false);
    setCid('');
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetState(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Submit Proof</DialogTitle>
          <DialogDescription>
            Upload your deliverable for "{task.title}" to IPFS and submit proof on-chain.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Upload File</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="text-sm">{file.name}</span>
                  {uploaded && <CheckCircle2 className="h-4 w-4 text-success" />}
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Drag & drop or click to upload
                  </p>
                </>
              )}
              <Input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {file && !uploaded && (
            <Button 
              onClick={handleUpload} 
              disabled={uploading}
              variant="outline"
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading to IPFS...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload to IPFS
                </>
              )}
            </Button>
          )}

          {uploaded && (
            <div className="p-3 bg-muted rounded-lg">
              <Label className="text-xs text-muted-foreground">IPFS CID</Label>
              <p className="font-mono text-sm break-all text-primary">{cid}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="Add any notes about your submission..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!uploaded || uploading}
            variant="cyber"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Proof On-Chain'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
