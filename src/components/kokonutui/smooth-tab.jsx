"use client";;
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";
import { cn } from "@/lib/utils";

const WaveformPath = () => (
  <motion.path
    animate={{
      x: [0, 10, 0],
      transition: {
        duration: 5,
        ease: "linear",
        repeat: Number.POSITIVE_INFINITY,
      },
    }}
    d="M0 50 
           C 20 40, 40 30, 60 50
           C 80 70, 100 60, 120 50
           C 140 40, 160 30, 180 50
           C 200 70, 220 60, 240 50
           C 260 40, 280 30, 300 50
           C 320 70, 340 60, 360 50
           C 380 40, 400 30, 420 50
           L 420 100 L 0 100 Z"
    initial={false} />
);

function TabCardContent({
  title,
  description,
  fillClass
}) {
  return (
    <div className="relative h-full">
      <div className="absolute inset-0 overflow-hidden">
        <svg
          aria-hidden="true"
          className="absolute bottom-0 h-32 w-full"
          preserveAspectRatio="none"
          role="presentation"
          viewBox="0 0 420 100">
          <motion.g
            animate={{ opacity: 0.15 }}
            className={`fill-${fillClass} stroke-${fillClass}`}
            initial={{ opacity: 0 }}
            style={{ strokeWidth: 1 }}
            transition={{ duration: 0.5 }}>
            <WaveformPath />
          </motion.g>
          <motion.g
            animate={{ opacity: 0.1 }}
            className={`fill-${fillClass} stroke-${fillClass}`}
            initial={{ opacity: 0 }}
            style={{ strokeWidth: 1, transform: "translateY(10px)" }}
            transition={{ duration: 0.5 }}>
            <WaveformPath />
          </motion.g>
        </svg>
      </div>
      <div className="relative flex h-full flex-col p-6">
        <div className="space-y-2">
          <h3
            className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 font-semibold text-2xl tracking-tight [text-shadow:_0_1px_1px_rgb(0_0_0_/_10%)]">
            {title}
          </h3>
          <p
            className="max-w-[90%] text-black/50 text-sm leading-relaxed dark:text-white/50">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

const DEFAULT_TABS = [
  {
    id: "Models",
    title: "Models",
    description: "Choose the model you want to use",
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    id: "MCPs",
    title: "MCPs",
    description: "Choose the MCP you want to use",
    color: "bg-purple-500 hover:bg-purple-600",
  },
  {
    id: "Agents",
    title: "Agents",
    description: "Choose the agent you want to use",
    color: "bg-emerald-500 hover:bg-emerald-600",
  },
  {
    id: "Users",
    title: "Users",
    description: "Choose the user you want to use",
    color: "bg-amber-500 hover:bg-amber-600",
  },
];

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? "20px" : "-20px",
    opacity: 0,
    filter: "blur(4px)",
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: "blur(0px)",
  },
  exit: (direction) => ({
    x: direction < 0 ? "20px" : "-20px",
    opacity: 0,
    filter: "blur(4px)",
  }),
};

const transition = {
  duration: 0.3,
  ease: "easeInOut",
};

export default function SmoothTab({
  items = DEFAULT_TABS,
  defaultTabId,
  className,
  activeColor = "bg-[#1F9CFE]",
  onChange
}) {
  const [selected, setSelected] = React.useState(defaultTabId || items[0]?.id);
  const [direction, setDirection] = React.useState(0);
  const [dimensions, setDimensions] = React.useState({ width: 0, left: 0 });

  // Reference for the selected button
  const buttonRefs = React.useRef(new Map());
  const containerRef = React.useRef(null);

  // Update dimensions whenever selected tab changes or on mount
  React.useLayoutEffect(() => {
    const updateDimensions = () => {
      const selectedButton = buttonRefs.current.get(selected);
      const container = containerRef.current;

      if (selectedButton && container) {
        const rect = selectedButton.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        setDimensions({
          width: rect.width,
          left: rect.left - containerRect.left,
        });
      }
    };

    // Initial update
    requestAnimationFrame(() => {
      updateDimensions();
    });

    // Update on resize
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [selected]);

  const handleTabClick = (tabId) => {
    const currentIndex = items.findIndex((item) => item.id === selected);
    const newIndex = items.findIndex((item) => item.id === tabId);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setSelected(tabId);
    onChange?.(tabId);
  };

  const handleKeyDown = (
    e,
    tabId
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleTabClick(tabId);
    }
  };

  const selectedItem = items.find((item) => item.id === selected);

  return (
    <div className={cn("flex h-full flex-col w-full", className)}>
      {/* Top Toolbar */}
      <div className="flex justify-center shrink-0 pb-6">
        <div
          aria-label="Smooth tabs"
          className={cn(
            "relative flex items-center justify-between gap-1 p-1.5",
            "bg-background/80 backdrop-blur-md",
            "rounded-2xl border border-muted-foreground/10",
            "shadow-xl"
          )}
          ref={containerRef}
          role="tablist">
          {/* Sliding Background */}
          <motion.div
            animate={{
              width: dimensions.width,
              x: dimensions.left,
              opacity: 1,
            }}
            className={cn("absolute z-[1] rounded-xl shadow-lg shadow-primary/20", selectedItem?.color || activeColor)}
            initial={false}
            style={{ height: "calc(100% - 12px)" }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
            }} />

          <div className="relative z-[2] flex gap-1">
            {items.map((item) => {
              const isSelected = selected === item.id;
              return (
                <motion.button
                  aria-controls={`panel-${item.id}`}
                  aria-selected={isSelected}
                  className={cn(
                    "relative flex items-center justify-center min-w-[100px] rounded-xl px-4 py-2",
                    "font-bold text-xs tracking-tight transition-all duration-300",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isSelected
                      ? "text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                  id={`tab-${item.id}`}
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  onKeyDown={(e) => handleKeyDown(e, item.id)}
                  ref={(el) => {
                    if (el) buttonRefs.current.set(item.id, el);
                    else buttonRefs.current.delete(item.id);
                  }}
                  role="tab"
                  tabIndex={isSelected ? 0 : -1}
                  type="button">
                  <span className="truncate uppercase">{item.title}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Card Content Area */}
      <div className="relative flex-1 min-h-0 bg-card/50 backdrop-blur-sm rounded-2xl border border-muted-foreground/10 overflow-hidden shadow-inner">
        <AnimatePresence custom={direction} initial={true} mode="wait">
          <motion.div
            key={selected}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            className="w-full h-full relative z-10"
          >
            {selectedItem?.content ?? (
              selectedItem && (
                <TabCardContent
                  title={selectedItem.title}
                  description={selectedItem.description ?? ""}
                  fillClass={selectedItem.color.split(" ").at(0)?.replace("bg-", "") ?? "blue-500"}
                />
              )
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
