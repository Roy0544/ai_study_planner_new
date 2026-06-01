"use client";

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';
import { Button } from './button';

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  securityLevel: 'loose',
  fontFamily: 'inherit',
  themeVariables: {
    primaryColor: '#3b82f6',
    primaryTextColor: '#fff',
    lineColor: '#6366f1',
    fontSize: '16px',
    // Mindmap specific colors (branch scales)
    cScale0: '#3b82f6', // Blue
    cScale1: '#10b981', // Emerald
    cScale2: '#f59e0b', // Amber
    cScale3: '#ef4444', // Red
    cScale4: '#8b5cf6', // Violet
    cScale5: '#ec4899', // Pink
    cScale6: '#06b6d4', // Cyan
    cScale7: '#f97316', // Orange
    cScale8: '#14b8a6', // Teal
    cScale9: '#6366f1', // Indigo
    cScale10: '#a855f7', // Purple
    cScale11: '#22c55e', // Green
    cScaleLabel0: '#ffffff',
    cScaleLabel1: '#ffffff',
    cScaleLabel2: '#ffffff',
    // Background and base
    background: 'transparent',
    mainBkg: '#18181b',
    nodeBorder: '#3f3f46',
  },
  mindmap: {
    useMaxWidth: false,
    padding: 20,
  }
});

export function MermaidDiagram({ chart }) {
  const containerRef = useRef(null);
  const [svg, setSvg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (chart) {
      setLoading(true);
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      mermaid.render(id, chart).then((result) => {
        setSvg(result.svg);
        setLoading(false);
      }).catch(err => {
         console.error("Mermaid rendering failed", err);
         setLoading(false);
      });
    }
  }, [chart]);

  if (!chart) return null;

  return (
    <div className="relative w-full h-full group flex flex-col">
      <TransformWrapper
        initialScale={1}
        minScale={0.2}
        maxScale={4}
        centerOnInit={true}
      >
        {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
          <>
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="secondary" 
                size="icon" 
                onClick={() => zoomIn()}
                className="rounded-full shadow-lg"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button 
                variant="secondary" 
                size="icon" 
                onClick={() => zoomOut()}
                className="rounded-full shadow-lg"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button 
                variant="secondary" 
                size="icon" 
                onClick={() => resetTransform()}
                className="rounded-full shadow-lg"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1 bg-zinc-950/50 rounded-xl border border-white/5 overflow-hidden">
               <TransformComponent
                wrapperStyle={{
                  width: "100%",
                  height: "100%",
                }}
                contentStyle={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
               >
                 {loading ? (
                    <div className="animate-pulse text-muted-foreground text-sm font-medium">
                      Rendering mind map...
                    </div>
                 ) : (
                    <div 
                      className="mermaid-content w-full h-full flex items-center justify-center p-8"
                      dangerouslySetInnerHTML={{ __html: svg }} 
                    />
                 )}
               </TransformComponent>
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
