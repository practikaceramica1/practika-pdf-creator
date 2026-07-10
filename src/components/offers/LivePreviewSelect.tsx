"use client";

import { useEffect, useId, useRef, useState } from "react";

type LivePreviewOption<T extends string> = {
  value: T;
  label: string;
};

type LivePreviewSelectProps<T extends string> = {
  label: React.ReactNode;
  value: T;
  options: readonly LivePreviewOption<T>[];
  onChange: (value: T) => void;
};

export function LivePreviewSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: LivePreviewSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();

  const selectedIdx = options.findIndex((o) => o.value === value);
  const selectedLabel = options.find((o) => o.value === value)?.label ?? String(value);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setHighlightIdx(selectedIdx >= 0 ? selectedIdx : 0);
  }, [open, selectedIdx]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const item = listRef.current.children[highlightIdx] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [open, highlightIdx]);

  function applyIndex(index: number) {
    setHighlightIdx(index);
    onChange(options[index]!.value);
  }

  function move(delta: 1 | -1) {
    const base = highlightIdx >= 0 ? highlightIdx : selectedIdx >= 0 ? selectedIdx : 0;
    const next = (base + delta + options.length) % options.length;
    applyIndex(next);
  }

  function openList(startIndex?: number) {
    const index = startIndex ?? (selectedIdx >= 0 ? selectedIdx : 0);
    setHighlightIdx(index);
    setOpen(true);
  }

  function onTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (!open) {
      if (
        event.key === "ArrowDown" ||
        event.key === "ArrowUp" ||
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight" ||
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        const start = selectedIdx >= 0 ? selectedIdx : 0;
        if (event.key === "ArrowDown" || event.key === "ArrowRight") {
          applyIndex((start + 1) % options.length);
          setOpen(true);
        } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
          applyIndex((start - 1 + options.length) % options.length);
          setOpen(true);
        } else {
          openList(start);
        }
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        event.preventDefault();
        move(1);
        break;
      case "ArrowUp":
      case "ArrowLeft":
        event.preventDefault();
        move(-1);
        break;
      case "Escape":
        event.preventDefault();
        setOpen(false);
        break;
      case "Enter":
        event.preventDefault();
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        break;
    }
  }

  return (
    <div ref={rootRef} className="relative flex flex-col gap-1">
      <span className="text-xs font-medium text-neutral-600">{label}</span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        className="flex w-full items-center justify-between rounded border border-neutral-300 bg-white px-3 py-2 text-left text-sm hover:bg-neutral-50"
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onTriggerKeyDown}
      >
        <span className="truncate">{selectedLabel}</span>
        <span aria-hidden className="ml-2 shrink-0 text-neutral-400">
          {open ? "▴" : "▾"}
        </span>
      </button>
      {open ? (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-activedescendant={`${listboxId}-opt-${highlightIdx}`}
          className="absolute top-[calc(100%-2px)] z-30 mt-1 max-h-52 w-full overflow-auto rounded border border-neutral-200 bg-white py-1 shadow-lg"
        >
          {options.map((opt, index) => {
            const highlighted = highlightIdx === index;
            const selected = value === opt.value;
            return (
              <li
                key={opt.value}
                id={`${listboxId}-opt-${index}`}
                role="option"
                aria-selected={selected}
                className={`cursor-pointer px-3 py-2 text-sm ${
                  highlighted ? "bg-[#E5ECFA] text-[#1a1f3d]" : "text-neutral-800"
                } ${selected && !highlighted ? "font-medium" : ""}`}
                onMouseEnter={() => setHighlightIdx(index)}
                onMouseDown={(event) => {
                  event.preventDefault();
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
