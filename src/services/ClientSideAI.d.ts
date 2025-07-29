// TypeScript declarations for ClientSideAI service

export interface ClientSideAIService {
  generateWithAI(prompt: string): Promise<string>;
  generateWithIntelligentRules(analysisData: CanvasAnalysis): Promise<string>;
  analyzeCanvas(elements: ExcalidrawElement[]): CanvasAnalysis;
}

export interface CanvasAnalysis {
  textElements: Array<{
    text: string;
    x: number;
    y: number;
    fontSize: number;
    fontFamily: string;
    color: string;
  }>;
  shapes: Array<{
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
  }>;
  layout: {
    width: number;
    height: number;
    sections: string[];
  };
  colors: string[];
  suggestions: {
    websiteType: string;
    title: string;
    description: string;
    sections: string[];
  };
}

export interface ExcalidrawElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  strokeColor?: string;
  backgroundColor?: string;
  [key: string]: any;
}

declare const ClientSideAI: ClientSideAIService;
export default ClientSideAI;
