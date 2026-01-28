import { useEffect, useRef } from "react";
import mermaid from "mermaid";

interface MermaidDiagramProps {
  chart: string;
  id?: string;
}

export const MermaidDiagram = ({ chart, id = "mermaid-chart" }: MermaidDiagramProps) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    // Initialize mermaid
    mermaid.initialize({
      startOnLoad: false,
      theme: "default",
      securityLevel: "loose",
      fontFamily: "Inter, system-ui, sans-serif",
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: "linear"
      }
    });

    // Generate unique ID for this instance
    const uniqueId = `${id}-${Date.now()}`;

    // Render the diagram
    mermaid.render(uniqueId, chart).then((result) => {
      if (elementRef.current) {
        elementRef.current.innerHTML = result.svg;
      }
    }).catch((error) => {
      console.error("Mermaid rendering error:", error);
      if (elementRef.current) {
        elementRef.current.innerHTML = `
          <div class="flex items-center justify-center h-64 text-muted-foreground">
            <div class="text-center">
              <p>Unable to render diagram</p>
              <p class="text-sm">Please check the diagram syntax</p>
            </div>
          </div>
        `;
      }
    });
  }, [chart, id]);

  return (
    <div className="w-full overflow-x-auto">
      <div 
        ref={elementRef}
        className="flex justify-center items-center min-h-[300px] p-4"
      />
    </div>
  );
};