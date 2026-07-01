"use client";

import { Paperclip, Send, Loader2 } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import { cn } from "@/lib/utils";

export default function AI_Input_Search({
  placeholder = "Search the web...",
  searchLabel = "Search",
  costText,
  onSubmit,
  className
}) {
  const [value, setValue] = useState("");
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 52,
    maxHeight: 200,
  });
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async () => {
    if (!value && !file) return;
    
    setIsUploading(true);
    try {
      await onSubmit?.({ text: value, file: file });
      setValue("");
      setFile(null);
      adjustHeight(true);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const allowedExtensions = ['pdf', 'txt', 'docx', 'pptx', 'xlsx', 'png', 'jpg', 'jpeg', 'webp'];
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
      if (!allowedExtensions.includes(fileExt)) {
        alert("Unsupported file format! Please upload PDF, TXT, Word (.docx), PowerPoint (.pptx), Excel (.xlsx) or Image files (PNG, JPG, WEBP).");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleContainerClick = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className={cn("w-full py-2", className)}>
      <div className="relative mx-auto w-full">
        <div
          aria-label="Search input container"
          className={cn(
            "relative flex w-full cursor-text flex-col rounded-xl text-left transition-all duration-200",
            "bg-app-inset border border-app-border focus-within:border-app-brand/75 focus-within:ring-1 focus-within:ring-app-brand/20",
            isFocused && "border-app-brand/75"
          )}
          onClick={handleContainerClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleContainerClick();
            }
          }}
          role="textbox"
          tabIndex={0}>
          <div className="max-h-[200px] overflow-y-auto">
            <Textarea
              className="w-full resize-none rounded-xl rounded-b-none border-none bg-transparent px-4 py-3 leading-[1.3] placeholder:text-text-muted focus-visible:ring-0 text-text-primary text-sm focus:outline-none"
              id="ai-input-04"
              onBlur={handleBlur}
              onChange={(e) => {
                setValue(e.target.value);
                adjustHeight();
              }}
              onFocus={handleFocus}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={placeholder}
              ref={textareaRef}
              value={value} />
          </div>

          <div className="flex items-center justify-between px-3 py-2 border-t border-app-border rounded-b-xl bg-app-card/40 select-none">
            {/* Left: Attachment trigger */}
            <div className="flex items-center gap-2">
              <label className={cn(
                "cursor-pointer rounded-lg p-2 transition-all flex items-center justify-center border",
                file 
                  ? "bg-app-brand/10 text-app-brand border-app-brand/20" 
                  : "bg-app-inset text-text-secondary border-app-border hover:bg-app-card hover:text-text-primary"
              )}>
                <input 
                  className="hidden" 
                  type="file" 
                  accept=".pdf,.txt,.docx,.pptx,.xlsx,.png,.jpg,.jpeg,.webp" 
                  onChange={handleFileChange} 
                />
                <Paperclip className="h-4 w-4" />
              </label>
              {file && (
                <span className="text-[10px] font-semibold text-app-brand max-w-[150px] truncate">
                  {file.name}
                </span>
              )}
            </div>

            {/* Right: Solid Vibrant Submit Action with adjacent Cost Indicator */}
            <div className="flex items-center gap-3">
              {costText && (
                <span className="text-[10px] text-text-muted flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px] text-app-brand">toll</span>
                  {costText}
                </span>
              )}
              <button
                className={cn(
                  "flex h-9 items-center gap-1.5 rounded-lg px-4 text-xs font-bold transition-all duration-200 border-none",
                  (value || file) && !isUploading
                    ? "bg-app-brand text-white hover:bg-app-brand-hover cursor-pointer"
                    : "bg-app-inset text-text-muted cursor-not-allowed border border-app-border"
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSubmit();
                }}
                disabled={(!value && !file) || isUploading}
                type="button">
                {isUploading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>{searchLabel}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
