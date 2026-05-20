"use client";

import {
  Type,
  AlignLeft,
  Mail,
  Hash,
  CircleDot,
  CheckSquare,
  ChevronDown,
  Square,
  Star,
  Calendar,
  GripVertical,
  MoreHorizontal,
  Copy,
  Trash2,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { BuilderField } from "~/hooks/use-form-builder";
import type { FieldType } from "@repo/schemas";

const FIELD_META: Record<FieldType, { icon: React.ElementType; label: string; color: string }> = {
  short_text: { icon: Type, label: "Short text", color: "#60a5fa" },
  long_text: { icon: AlignLeft, label: "Long text", color: "#34d399" },
  email: { icon: Mail, label: "Email", color: "#f472b6" },
  number: { icon: Hash, label: "Number", color: "#fb923c" },
  single_select: { icon: CircleDot, label: "Single select", color: "#a78bfa" },
  multi_select: { icon: CheckSquare, label: "Multi select", color: "#38bdf8" },
  dropdown: { icon: ChevronDown, label: "Dropdown", color: "#4ade80" },
  checkbox: { icon: Square, label: "Checkbox", color: "#fbbf24" },
  rating: { icon: Star, label: "Rating", color: "#f4c95d" },
  date: { icon: Calendar, label: "Date", color: "#fb7185" },
};

interface FieldCardProps {
  field: BuilderField;
  index: number;
  isSelected: boolean;
  isDragging?: boolean;
  dragHandleProps?: Record<string, unknown>;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function FieldCard({
  field,
  index,
  isSelected,
  isDragging,
  dragHandleProps,
  onSelect,
  onDuplicate,
  onDelete,
}: FieldCardProps) {
  const meta = FIELD_META[field.type];
  const Icon = meta.icon;

  return (
    <div
      onClick={onSelect}
      className={cn(
        "group relative flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-all",
        isSelected
          ? "border-l-2 border-l-[#f4c95d] border-r-[#3a3830] border-t-[#3a3830] border-b-[#3a3830] bg-[#2e2c26]"
          : "border-[#2e2c26] bg-[#252420] hover:bg-[#2a2822] hover:border-[#3a3830]",
        isDragging && "opacity-50 shadow-2xl",
      )}
    >
      {/* Drag handle */}
      <div
        {...dragHandleProps}
        className="shrink-0 cursor-grab text-[#4a4640] opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Type icon */}
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: `${meta.color}18` }}
      >
        <Icon className="h-3.5 w-3.5" style={{ color: meta.color }} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#d8d0c4]">{field.label}</p>
        <p className="text-[10px] text-[#6a6460]">{meta.label}</p>
      </div>

      {/* Required dot */}
      {field.required && (
        <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#f4c95d]/60" title="Required" />
      )}

      {/* Kebab menu */}
      <div
        className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-6 w-6 text-[#6a6460] hover:bg-[#3a3830] hover:text-[#d8d0c4]"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="right"
            align="start"
            className="w-40 rounded-xl border-[#3a3830] bg-[#252420] shadow-2xl"
          >
            <DropdownMenuItem
              onSelect={onDuplicate}
              className="gap-2 text-[#c8c0b0] focus:bg-[#3a3830] focus:text-white cursor-pointer"
            >
              <Copy className="h-3.5 w-3.5" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#3a3830]" />
            <DropdownMenuItem
              onSelect={onDelete}
              className="gap-2 text-red-400 focus:bg-red-900/30 focus:text-red-300 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
