import { useState, useCallback } from "react";
import { Scan, Github, Zap, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropZone } from "@/components/DropZone";
import { OCRResults } from "@/components/OCRResults";
import { ApiConfig } from "@/components/ApiConfig";
import { useOCR } from "@/hooks/useOCR";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [apiUrl, setApiUrl] = useState("http://localhost:8000");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const { isProcessing, results, error, processImage, testConnection, reset } = useOCR(apiUrl);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    reset();
  }, [reset]);

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    reset();
  }, [reset]);

  const handleProcess = useCallback(async () => {
    if (!selectedFile) return;

    const result = await processImage(selectedFile);
    
    if (result?.success) {
      toast({
        title: "Pattern Extracted",
        description: `Found: ${result.target_match?.pattern_found}`,
      });
    } else if (result && !result.success) {
      toast({
        title: "No Pattern Found",
        description: "Could not find a matching pattern in the image",
        variant: "destructive",
      });
    }
  }, [selectedFile, processImage, toast]);

  const handleTestConnection = useCallback(async () => {
    const connected = await testConnection();
    setIsConnected(connected);
    return connected;
  }, [testConnection]);

  return (
    <div className="min-h-screen bg-background">
      {/* Noise texture overlay */}
      <div className="fixed inset-0 noise pointer-events-none" />
      
      {/* Grid background */}
      <div className="fixed inset-0 grid-pattern opacity-30 pointer-events-none" />

      {/* Header */}
      <header className="relative border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative p-2 rounded-xl bg-primary/10 glow-primary">
                <Scan className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">ShipLabel OCR</h1>
                <p className="text-xs text-muted-foreground">Pattern Extraction System</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ApiConfig 
                apiUrl={apiUrl}
                setApiUrl={setApiUrl}
                isConnected={isConnected}
                onTest={handleTestConnection}
              />
              <Button variant="outline" size="icon" asChild>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero section */}
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Extract Tracking Patterns from
              <span className="gradient-text block mt-1">Shipping Labels</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Upload your shipping label image and automatically extract tracking numbers 
              matching the pattern <code className="px-2 py-1 rounded bg-muted font-mono text-sm">*_1_*</code>
            </p>
          </div>

          {/* Features badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {[
              { icon: Zap, label: "Multi-Engine OCR" },
              { icon: Server, label: "Tesseract + EasyOCR + PaddleOCR" },
            ].map(({ icon: Icon, label }) => (
              <div 
                key={label}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border"
              >
                <Icon className="w-4 h-4 text-primary" />
                <span className="text-sm">{label}</span>
              </div>
            ))}
          </div>

          {/* Main card */}
          <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left: Upload section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center font-mono">1</span>
                  Upload Image
                </h3>
                
                <DropZone 
                  onFileSelect={handleFileSelect}
                  selectedFile={selectedFile}
                  onClear={handleClear}
                  isProcessing={isProcessing}
                />

                {selectedFile && (
                  <Button 
                    onClick={handleProcess}
                    disabled={isProcessing}
                    className="w-full h-12 text-base font-semibold glow-primary"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 mr-2 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Scan className="w-5 h-5 mr-2" />
                        Extract Pattern
                      </>
                    )}
                  </Button>
                )}

                {error && (
                  <p className="text-sm text-warning bg-warning/10 px-4 py-2 rounded-lg">
                    {error}
                  </p>
                )}
              </div>

              {/* Right: Results section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center font-mono">2</span>
                  Results
                </h3>

                {results ? (
                  <OCRResults results={results} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 rounded-xl border border-dashed border-border bg-muted/20">
                    <Scan className="w-12 h-12 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground text-sm">
                      Results will appear here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Backend setup hint */}
          <div className="mt-8 rounded-xl border border-border bg-card/30 p-6">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Server className="w-4 h-4 text-primary" />
              Backend Setup
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              To use real OCR processing, run the Python backend server:
            </p>
            <pre className="p-4 rounded-lg bg-background border border-border font-mono text-sm overflow-x-auto">
              <code>cd ocr-shipping-label && streamlit run app.py</code>
            </pre>
            <p className="text-xs text-muted-foreground mt-3">
              Without a connected backend, demo mode will simulate results for testing the UI.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-border mt-16">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            Built for extracting patterns like <code className="px-2 py-0.5 rounded bg-muted font-mono">163233702292313922_1_lWV</code> from shipping labels
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
