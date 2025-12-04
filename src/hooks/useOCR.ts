import { useState, useCallback } from "react";

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

interface OCRResponse {
  success: boolean;
  target_match: MatchResult | null;
  ocr_results: OCRResult[];
  full_text: string;
  preprocessing_steps: string[];
  error?: string;
}

export function useOCR(apiUrl: string) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<OCRResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processImage = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setResults(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`${apiUrl}/api/ocr`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data: OCRResponse = await response.json();
      setResults(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to process image";
      setError(message);
      
      // For demo purposes, return mock data if API is not available
      if (message.includes("Failed to fetch") || message.includes("NetworkError")) {
        const mockResults = generateMockResults(file.name);
        setResults(mockResults);
        setError("Demo mode: Using simulated results (backend not connected)");
        return mockResults;
      }
      
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [apiUrl]);

  const testConnection = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(`${apiUrl}/api/health`, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }, [apiUrl]);

  const reset = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  return {
    isProcessing,
    results,
    error,
    processImage,
    testConnection,
    reset,
  };
}

// Mock data generator for demo purposes
function generateMockResults(filename: string): OCRResponse {
  const mockPatterns = [
    "163233702292313922_1_lWV",
    "163233702292313923_1_xYz",
    "163233702292313924_1_aBc",
  ];
  
  const randomPattern = mockPatterns[Math.floor(Math.random() * mockPatterns.length)];
  const confidence = 75 + Math.random() * 20;

  return {
    success: true,
    target_match: {
      matched_text: `TRACKING: ${randomPattern} SHIP TO: 123 Main St`,
      score: confidence,
      pattern_found: randomPattern,
    },
    ocr_results: [
      { text: "SHIPPING", confidence: 0.95, engine: "tesseract" },
      { text: "LABEL", confidence: 0.92, engine: "tesseract" },
      { text: randomPattern, confidence: confidence / 100, engine: "easyocr" },
      { text: "SHIP", confidence: 0.88, engine: "paddleocr" },
      { text: "TO:", confidence: 0.91, engine: "paddleocr" },
      { text: "123", confidence: 0.85, engine: "tesseract" },
      { text: "Main", confidence: 0.87, engine: "easyocr" },
      { text: "St", confidence: 0.89, engine: "easyocr" },
    ],
    full_text: `SHIPPING LABEL\nTRACKING: ${randomPattern}\nSHIP TO: 123 Main St\nCity, State 12345`,
    preprocessing_steps: ["grayscale", "denoise", "contrast_enhance", "deskew", "adaptive_threshold"],
  };
}
