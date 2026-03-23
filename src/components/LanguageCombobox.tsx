"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const LANGUAGES = [
  { label: "Arabic", value: "ar" },
  { label: "Chinese", value: "zh" },
  { label: "Danish", value: "da" },
  { label: "Dutch", value: "nl" },
  { label: "English", value: "en" },
  { label: "Finnish", value: "fi" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Greek", value: "el" },
  { label: "Hebrew", value: "he" },
  { label: "Hindi", value: "hi" },
  { label: "Hungarian", value: "hu" },
  { label: "Italian", value: "it" },
  { label: "Japanese", value: "ja" },
  { label: "Korean", value: "ko" },
  { label: "Norwegian", value: "no" },
  { label: "Persian", value: "fa" },
  { label: "Polish", value: "pl" },
  { label: "Portuguese", value: "pt" },
  { label: "Romanian", value: "ro" },
  { label: "Russian", value: "ru" },
  { label: "Spanish", value: "es" },
  { label: "Swedish", value: "sv" },
  { label: "Thai", value: "th" },
  { label: "Turkish", value: "tr" },
];

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function LanguageCombobox({ value, onChange }: Props) {
  const selected = LANGUAGES.find((l) => l.value === value) ?? null;
  const [query, setQuery] = useState(selected?.label ?? "");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? LANGUAGES.filter((l) => l.label.toLowerCase().includes(query.toLowerCase()))
    : LANGUAGES;

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        // reset input to selected label if user typed without picking
        setQuery(selected?.label ?? "");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [selected]);

  function handleSelect(lang: { label: string; value: string }) {
    onChange(lang.value);
    setQuery(lang.label);
    setOpen(false);
  }

  function handleClear() {
    onChange("");
    setQuery("");
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Input
          placeholder="Any language…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (e.target.value === "") onChange("");
          }}
          onFocus={() => setOpen(true)}
          className="w-full pr-7"
        />
        {value && (
          <button
            onMouseDown={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
          >
            ✕
          </button>
        )}
      </div>
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-52 overflow-y-auto">
          {filtered.map((lang) => (
            <li
              key={lang.value}
              onMouseDown={() => handleSelect(lang)}
              className={cn(
                "px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors",
                value === lang.value && "bg-accent font-medium"
              )}
            >
              {lang.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
