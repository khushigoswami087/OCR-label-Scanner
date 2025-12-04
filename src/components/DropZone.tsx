import { useCallback, useState } from "react";
import { Upload, Image, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
  isProcessing: boolean;
}

export function DropZone({ onFileSelect, selectedFile, onClear, isProcessing }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        onFileSelect(file);
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(file);
      }
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      onFileSelect(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, [onFileSelect]);

  const handleClear = useCallback(() => {
    setPreview(null);
    onClear();
  }, [onClear]);

  if (selectedFile && preview) {
    return (
      <div className="relative group">
        <div className="relative overflow-hidden rounded-xl border border-border bg-card">
          {/* Scanning effect when processing */}
          {isProcessing && (
            <div className="absolute inset-0 z-10 overflow-hidden">
              <div className="absolute inset-x-0 h-1/3 scan-line animate-scan" />
            </div>
          )}
          
          <img 
            src={preview} 
            alt="Uploaded shipping label"
            className={cn(
              "w-full h-auto max-h-96 object-contain transition-all duration-300",
              isProcessing && "opacity-80"
            )}
          />
          
          {/* Clear button */}
          {!isProcessing && (
            <button
              onClick={handleClear}
              className="absolute top-3 right-3 p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border hover:bg-destructive hover:border-destructive transition-colors group/btn"
            >
              <X className="w-4 h-4 text-muted-foreground group-hover/btn:text-destructive-foreground" />
            </button>
          )}
        </div>
        
        <p className="mt-3 text-sm text-muted-foreground text-center font-mono">
          {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
        </p>
      </div>
    );
  }

  return (
    <div
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={cn(
        "relative overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer group",
        isDragging 
          ? "border-primary bg-primary/5 glow-border" 
          : "border-border hover:border-primary/50 hover:bg-muted/30"
      )}
    >
      {/* Grid pattern background */}
      <div className="absolute inset-0 grid-pattern opacity-50" />
      
      <label className="relative flex flex-col items-center justify-center p-12 cursor-pointer">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
        
        <div className={cn(
          "relative p-4 rounded-2xl bg-secondary/50 mb-6 transition-all duration-300",
          isDragging && "scale-110 bg-primary/20"
        )}>
          {isDragging ? (
            <Image className="w-12 h-12 text-primary" />
          ) : (
            <Upload className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors" />
          )}
          
          {/* Glow effect */}
          <div className={cn(
            "absolute inset-0 rounded-2xl blur-xl transition-opacity duration-300",
            isDragging ? "bg-primary/30 opacity-100" : "bg-primary/20 opacity-0 group-hover:opacity-100"
          )} />
        </div>
        
        <h3 className="text-lg font-semibold mb-2">
          {isDragging ? "Drop your image here" : "Upload Shipping Label"}
        </h3>
        
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Drag and drop your shipping label image, or click to browse
        </p>
        
        <div className="flex gap-2 mt-4">
          {["PNG", "JPG", "WEBP"].map((format) => (
            <span 
              key={format}
              className="px-2 py-1 text-xs font-mono rounded bg-muted text-muted-foreground"
            >
              {format}
            </span>
          ))}
        </div>
      </label>
    </div>
  );
}
