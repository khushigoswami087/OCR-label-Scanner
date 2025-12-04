import { CheckCircle2, XCircle, Copy, Download, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface OCRResult {
  text: string;
  confidence: number;
  engine: string;
  bbox?: [number, number, number, number];
}

interface MatchResult {
  matched_text: string;
  score: number;
  pattern_found: string;
}

interface OCRResultsProps {
  results: {
    success: boolean;
    target_match: MatchResult | null;
    ocr_results: OCRResult[];
    full_text: string;
    preprocessing_steps: string[];
  } | null;
}

export function OCRResults({ results }: OCRResultsProps) {
  const { toast } = useToast();
  const [showFullOCR, setShowFullOCR] = useState(false);
  const [showJSON, setShowJSON] = useState(false);

  if (!results) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ocr_results.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const confidenceColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      {/* Main Result Card */}
      <div className={cn(
        "relative overflow-hidden rounded-xl border p-6",
        results.success 
          ? "border-success/30 bg-success/5" 
          : "border-destructive/30 bg-destructive/5"
      )}>
        {/* Status indicator */}
        <div className="flex items-center gap-3 mb-4">
          {results.success ? (
            <>
              <CheckCircle2 className="w-6 h-6 text-success" />
              <span className="text-lg font-semibold text-success">Pattern Found</span>
            </>
          ) : (
            <>
              <XCircle className="w-6 h-6 text-destructive" />
              <span className="text-lg font-semibold text-destructive">No Match Found</span>
            </>
          )}
        </div>

        {results.target_match && (
          <div className="space-y-4">
            {/* Pattern Found */}
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Extracted Pattern
              </label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 px-4 py-3 rounded-lg bg-background border border-border font-mono text-lg text-primary break-all">
                  {results.target_match.pattern_found}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(results.target_match!.pattern_found, "Pattern")}
                  className="shrink-0"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Full Matched Line */}
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Full Matched Line
              </label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 px-4 py-3 rounded-lg bg-background border border-border font-mono text-sm break-all">
                  {results.target_match.matched_text}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(results.target_match!.matched_text, "Line")}
                  className="shrink-0"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Confidence Score */}
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Confidence Score
              </label>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      results.target_match.score >= 80 ? "bg-success" :
                      results.target_match.score >= 60 ? "bg-warning" : "bg-destructive"
                    )}
                    style={{ width: `${results.target_match.score}%` }}
                  />
                </div>
                <span className={cn(
                  "font-mono text-xl font-bold",
                  confidenceColor(results.target_match.score)
                )}>
                  {results.target_match.score.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Processing Steps */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h4 className="text-sm font-medium mb-3">Preprocessing Pipeline</h4>
        <div className="flex flex-wrap gap-2">
          {results.preprocessing_steps.map((step, i) => (
            <span 
              key={i}
              className="px-3 py-1 text-xs font-mono rounded-full bg-secondary text-secondary-foreground"
            >
              {i + 1}. {step}
            </span>
          ))}
        </div>
      </div>

      {/* Full OCR Output */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <button
          onClick={() => setShowFullOCR(!showFullOCR)}
          className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
        >
          <h4 className="text-sm font-medium">Full OCR Output</h4>
          {showFullOCR ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {showFullOCR && (
          <div className="p-4 pt-0">
            <pre className="p-4 rounded-lg bg-background border border-border text-xs font-mono overflow-auto max-h-48 whitespace-pre-wrap">
              {results.full_text || "No text extracted"}
            </pre>
            
            {/* Per-engine results */}
            <div className="mt-4 space-y-2">
              {results.ocr_results.slice(0, 10).map((r, i) => (
                <div 
                  key={i}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/30"
                >
                  <span className="px-2 py-0.5 text-xs font-mono rounded bg-primary/20 text-primary">
                    {r.engine}
                  </span>
                  <span className="flex-1 text-sm font-mono truncate">{r.text}</span>
                  <span className={cn(
                    "text-xs font-mono",
                    confidenceColor(r.confidence * 100)
                  )}>
                    {(r.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
              {results.ocr_results.length > 10 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  +{results.ocr_results.length - 10} more results
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* JSON Export */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <button
          onClick={() => setShowJSON(!showJSON)}
          className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
        >
          <h4 className="text-sm font-medium">JSON Output</h4>
          {showJSON ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {showJSON && (
          <div className="p-4 pt-0">
            <pre className="p-4 rounded-lg bg-background border border-border text-xs font-mono overflow-auto max-h-64">
              {JSON.stringify(results, null, 2)}
            </pre>
            <Button onClick={downloadJSON} variant="outline" className="w-full mt-3">
              <Download className="w-4 h-4 mr-2" />
              Download JSON
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
