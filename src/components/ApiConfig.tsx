import { useState } from "react";
import { Settings, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ApiConfigProps {
  apiUrl: string;
  setApiUrl: (url: string) => void;
  isConnected: boolean;
  onTest: () => Promise<boolean>;
}

export function ApiConfig({ apiUrl, setApiUrl, isConnected, onTest }: ApiConfigProps) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await onTest();
    setTestResult(result);
    setTesting(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Settings className="w-4 h-4" />
          <span className={cn(
            "absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-background",
            isConnected ? "bg-success" : "bg-warning"
          )} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>API Configuration</DialogTitle>
          <DialogDescription>
            Connect to your Python OCR backend server
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Backend URL</label>
            <Input
              placeholder="http://localhost:8000"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Enter the URL where your Python OCR backend is running
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              onClick={handleTest} 
              disabled={testing || !apiUrl}
              variant="secondary"
              className="flex-1"
            >
              {testing ? "Testing..." : "Test Connection"}
            </Button>
            
            {testResult !== null && (
              <div className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                testResult ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
              )}>
                {testResult ? (
                  <>
                    <Check className="w-4 h-4" />
                    Connected
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    Failed
                  </>
                )}
              </div>
            )}
          </div>

          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <h4 className="text-sm font-medium">Expected Endpoints</h4>
            <div className="space-y-1 text-xs font-mono text-muted-foreground">
              <p>POST /api/ocr - Process image</p>
              <p>GET /api/health - Health check</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
