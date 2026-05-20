"use client";

import { useReducer, useEffect, useRef, useCallback } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";
import { trpc } from "~/trpc/client";
import type { RouterOutputs } from "@repo/trpc/client";
import type { FieldType } from "@repo/schemas";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────

export type BuilderField = {
  id: string;
  order: number;
  type: FieldType;
  label: string;
  helpText?: string;
  required: boolean;
  config: Record<string, unknown>;
};

export type SaveState = "idle" | "saving" | "saved" | "error";

export type BuilderState = {
  fields: BuilderField[];
  selectedFieldId: string | null;
  previewMode: boolean;
  saveState: SaveState;
  dirty: boolean;
};

export type BuilderAction =
  | { type: "ADD_FIELD"; fieldType: FieldType }
  | { type: "DELETE_FIELD"; id: string }
  | { type: "DUPLICATE_FIELD"; id: string }
  | { type: "SELECT_FIELD"; id: string | null }
  | { type: "UPDATE_FIELD"; id: string; patch: Partial<BuilderField> }
  | { type: "REORDER"; oldIndex: number; newIndex: number }
  | { type: "SET_SAVE_STATE"; state: SaveState }
  | { type: "TOGGLE_PREVIEW" }
  | { type: "MARK_CLEAN" };

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_CONFIGS: Record<FieldType, Record<string, unknown>> = {
  short_text: {},
  long_text: {},
  email: {},
  number: {},
  single_select: { options: [{ value: "option-1", label: "Option 1" }] },
  multi_select: { options: [{ value: "option-1", label: "Option 1" }] },
  dropdown: { options: [{ value: "option-1", label: "Option 1" }] },
  checkbox: {},
  rating: { scale: 5, icon: "star" },
  date: {},
};

const DEFAULT_LABELS: Record<FieldType, string> = {
  short_text: "Short answer",
  long_text: "Long answer",
  email: "Email address",
  number: "Number",
  single_select: "Single choice",
  multi_select: "Multiple choice",
  dropdown: "Dropdown choice",
  checkbox: "I agree to the terms",
  rating: "Rate your experience",
  date: "Pick a date",
};

// ── Reducer ───────────────────────────────────────────────────────────────────

function reducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case "ADD_FIELD": {
      const field: BuilderField = {
        id: crypto.randomUUID(),
        order: state.fields.length,
        type: action.fieldType,
        label: DEFAULT_LABELS[action.fieldType],
        required: false,
        config: DEFAULT_CONFIGS[action.fieldType],
      };
      return {
        ...state,
        fields: [...state.fields, field],
        selectedFieldId: field.id,
        dirty: true,
      };
    }
    case "DELETE_FIELD": {
      const next = state.fields
        .filter((f) => f.id !== action.id)
        .map((f, i) => ({ ...f, order: i }));
      const sel =
        state.selectedFieldId === action.id ? (next[0]?.id ?? null) : state.selectedFieldId;
      return { ...state, fields: next, selectedFieldId: sel, dirty: true };
    }
    case "DUPLICATE_FIELD": {
      const idx = state.fields.findIndex((f) => f.id === action.id);
      if (idx === -1) return state;
      const src = state.fields[idx]!;
      const copy: BuilderField = { ...src, id: crypto.randomUUID(), label: `${src.label} (copy)` };
      const next = [
        ...state.fields.slice(0, idx + 1),
        copy,
        ...state.fields.slice(idx + 1),
      ].map((f, i) => ({ ...f, order: i }));
      return { ...state, fields: next, selectedFieldId: copy.id, dirty: true };
    }
    case "SELECT_FIELD":
      return { ...state, selectedFieldId: action.id };
    case "UPDATE_FIELD": {
      const fields = state.fields.map((f) =>
        f.id === action.id ? { ...f, ...action.patch } : f,
      );
      return { ...state, fields, dirty: true };
    }
    case "REORDER": {
      const fields = arrayMove(state.fields, action.oldIndex, action.newIndex).map((f, i) => ({
        ...f,
        order: i,
      }));
      return { ...state, fields, dirty: true };
    }
    case "SET_SAVE_STATE":
      return { ...state, saveState: action.state };
    case "TOGGLE_PREVIEW":
      return { ...state, previewMode: !state.previewMode };
    case "MARK_CLEAN":
      return { ...state, dirty: false };
    default:
      return state;
  }
}

// ── Debounce ──────────────────────────────────────────────────────────────────

function useDebouncedCallback<T extends (...args: Parameters<T>) => void>(fn: T, ms: number): (...args: Parameters<T>) => void {
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  return useCallback(
    (...args: Parameters<T>) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => fn(...args), ms);
    },
    [fn, ms],
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

type DBField = RouterOutputs["forms"]["get"]["fields"][number];

function toBuilderField(f: DBField): BuilderField {
  return {
    id: f.id,
    order: f.order,
    type: f.type as FieldType,
    label: f.label,
    helpText: f.helpText ?? undefined,
    required: f.required ?? false,
    config: (f.config ?? {}) as Record<string, unknown>,
  };
}

export function useFormBuilder(formId: string, initialFields: DBField[]) {
  const [state, dispatch] = useReducer(reducer, {
    fields: initialFields.map(toBuilderField),
    selectedFieldId: initialFields[0]?.id ?? null,
    previewMode: false,
    saveState: "idle",
    dirty: false,
  });

  const updateFields = trpc.forms.updateFields.useMutation({
    onMutate: () => dispatch({ type: "SET_SAVE_STATE", state: "saving" }),
    onSuccess: () => {
      dispatch({ type: "SET_SAVE_STATE", state: "saved" });
      dispatch({ type: "MARK_CLEAN" });
      setTimeout(() => dispatch({ type: "SET_SAVE_STATE", state: "idle" }), 2000);
    },
    onError: () => {
      dispatch({ type: "SET_SAVE_STATE", state: "error" });
      toast.error("Auto-save failed — your changes aren't persisted yet.");
    },
  });

  const doSave = useCallback(
    (fields: BuilderField[]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateFields.mutate({ id: formId, fields: fields as any });
    },
    [formId, updateFields],
  );

  const debouncedSave = useDebouncedCallback(doSave, 800);

  useEffect(() => {
    if (state.dirty) debouncedSave(state.fields);
  }, [state.fields, state.dirty, debouncedSave]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = state.fields.findIndex((f) => f.id === String(active.id));
    const newIndex = state.fields.findIndex((f) => f.id === String(over.id));
    if (oldIndex !== -1 && newIndex !== -1) dispatch({ type: "REORDER", oldIndex, newIndex });
  }

  const selectedField = state.fields.find((f) => f.id === state.selectedFieldId) ?? null;

  return { state, dispatch, handleDragEnd, selectedField };
}
