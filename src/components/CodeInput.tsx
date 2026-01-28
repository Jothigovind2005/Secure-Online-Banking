import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  placeholder?: string;
  className?: string;
}

export const CodeInput = ({ 
  value, 
  onChange, 
  language = "javascript", 
  placeholder = "Paste your code here...",
  className 
}: CodeInputProps) => {
  const [lines, setLines] = useState(1);

  useEffect(() => {
    const lineCount = value.split('\n').length;
    setLines(Math.max(lineCount, 10));
  }, [value]);

  return (
    <div className={cn("relative", className)}>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "font-mono text-sm resize-none pl-12",
          "bg-slate-50 dark:bg-slate-900",
          "border-slate-200 dark:border-slate-700",
          "focus:border-primary",
          "min-h-[300px]"
        )}
        rows={lines}
        spellCheck={false}
      />
      
      {/* Language indicator */}
      {language && language !== "auto" && (
        <div className="absolute top-2 right-2">
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
            {language}
          </span>
        </div>
      )}
      
      {/* Line numbers */}
      <div className="absolute left-2 top-2 text-xs text-muted-foreground font-mono leading-6 select-none pointer-events-none">
        {Array.from({ length: lines }, (_, i) => (
          <div key={i + 1} className="h-6">
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
};