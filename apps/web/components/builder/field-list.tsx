"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DragEndEvent } from "@dnd-kit/core";
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
  Plus,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { FieldCard } from "./field-card";
import type { BuilderField, BuilderAction } from "~/hooks/use-form-builder";
import type { FieldType } from "@repo/schemas";

const FIELD_TYPES: Array<{ type: FieldType; label: string; icon: React.ElementType; color: string }> = [
  { type: "short_text", label: "Short text", icon: Type, color: "#60a5fa" },
  { type: "long_text", label: "Long text", icon: AlignLeft, color: "#34d399" },
  { type: "email", label: "Email", icon: Mail, color: "#f472b6" },
  { type: "number", label: "Number", icon: Hash, color: "#fb923c" },
  { type: "single_select", label: "Single select", icon: CircleDot, color: "#a78bfa" },
  { type: "multi_select", label: "Multi select", icon: CheckSquare, color: "#38bdf8" },
  { type: "dropdown", label: "Dropdown", icon: ChevronDown, color: "#4ade80" },
  { type: "checkbox", label: "Checkbox", icon: Square, color: "#fbbf24" },
  { type: "rating", label: "Rating", icon: Star, color: "#f4c95d" },
  { type: "date", label: "Date", icon: Calendar, color: "#fb7185" },
];

interface SortableFieldCardProps {
  field: BuilderField;
  index: number;
  isSelected: boolean;
  dispatch: React.Dispatch<BuilderAction>;
}

function SortableFieldCard({ field, index, isSelected, dispatch }: SortableFieldCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <FieldCard
        field={field}
        index={index}
        isSelected={isSelected}
        isDragging={isDragging}
        dragHandleProps={listeners}
        onSelect={() => dispatch({ type: "SELECT_FIELD", id: field.id })}
        onDuplicate={() => dispatch({ type: "DUPLICATE_FIELD", id: field.id })}
        onDelete={() => dispatch({ type: "DELETE_FIELD", id: field.id })}
      />
    </div>
  );
}

interface FieldListProps {
  fields: BuilderField[];
  selectedFieldId: string | null;
  dispatch: React.Dispatch<BuilderAction>;
  onDragEnd: (event: DragEndEvent) => void;
}

export function FieldList({ fields, selectedFieldId, dispatch, onDragEnd }: FieldListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  return (
    <div className="flex h-full w-[300px] shrink-0 flex-col bg-[#1e1c18]">
      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-[#2e2c26] px-4 py-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#6a6460]">
          Fields
        </span>
        <span className="text-xs text-[#4a4640]">{fields.length}</span>
      </div>

      {/* Field cards */}
      <div className="flex-1 overflow-y-auto p-2">
        {fields.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 py-12 text-center">
            <p className="text-sm text-[#4a4640]">No fields yet</p>
            <p className="text-xs text-[#3a3830]">Add your first field below</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1.5">
                {fields.map((field, i) => (
                  <SortableFieldCard
                    key={field.id}
                    field={field}
                    index={i}
                    isSelected={field.id === selectedFieldId}
                    dispatch={dispatch}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Add field button */}
      <div className="border-t border-[#2e2c26] p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="w-full gap-2 bg-[#2a2822] text-[#c8c0b0] hover:bg-[#3a3830] hover:text-white border border-[#3a3830]"
              size="sm"
            >
              <Plus className="h-3.5 w-3.5" />
              Add field
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            className="mb-1 w-52 rounded-xl border-[#3a3830] bg-[#252420] p-1.5 shadow-2xl"
          >
            {FIELD_TYPES.map((ft, i) => {
              const Icon = ft.icon;
              const isLast = i === FIELD_TYPES.length - 1;
              const showSep = i === 3 || i === 7;
              return (
                <div key={ft.type}>
                  {showSep && <DropdownMenuSeparator className="my-1 bg-[#3a3830]" />}
                  <DropdownMenuItem
                    onSelect={() => dispatch({ type: "ADD_FIELD", fieldType: ft.type })}
                    className="gap-2.5 rounded-lg text-[#c8c0b0] focus:bg-[#3a3830] focus:text-white cursor-pointer py-2"
                  >
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-md"
                      style={{ backgroundColor: `${ft.color}18` }}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color: ft.color }} />
                    </div>
                    {ft.label}
                  </DropdownMenuItem>
                </div>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
