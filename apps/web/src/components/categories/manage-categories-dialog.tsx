"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/use-categories";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import type { CategoryKind } from "@/lib/shared";
import type { Category } from "@/lib/types";

interface ManageCategoriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageCategoriesDialog({ open, onOpenChange }: ManageCategoriesDialogProps) {
  const [kind, setKind] = useState<CategoryKind>("EXPENSE");
  const { data: categories = [] } = useCategories();
  const { user } = useAuth();

  const grouped = useMemo(() => {
    const inKind = categories.filter((c) => c.kind === kind);
    const childrenByParent = new Map<string, Category[]>();
    inKind.forEach((c) => {
      if (!c.parentId) return;
      childrenByParent.set(c.parentId, [...(childrenByParent.get(c.parentId) ?? []), c]);
    });
    const groups = inKind
      .filter((c) => !c.parentId && childrenByParent.has(c.id))
      .map((parent) => ({ parent, children: childrenByParent.get(parent.id)! }));
    const standalone = inKind.filter((c) => !c.parentId && !childrenByParent.has(c.id));
    return { groups, standalone };
  }, [categories, kind]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Manage categories">
        <Tabs value={kind} onValueChange={(v) => setKind(v as CategoryKind)}>
          <TabsList>
            <TabsTrigger value="EXPENSE">Expense</TabsTrigger>
            <TabsTrigger value="INCOME">Income</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-4 flex max-h-[50vh] flex-col gap-4 overflow-y-auto">
          {grouped.groups.map(({ parent, children }) => (
            <div key={parent.id} className="flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{parent.name}</p>
              {children.map((category) => (
                <CategoryRow key={category.id} category={category} canEdit={category.userId === user?.id} />
              ))}
            </div>
          ))}

          {grouped.standalone.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Custom</p>
              {grouped.standalone.map((category) => (
                <CategoryRow key={category.id} category={category} canEdit={category.userId === user?.id} />
              ))}
            </div>
          )}
        </div>

        <AddCategoryRow kind={kind} />
      </DialogContent>
    </Dialog>
  );
}

function CategoryRow({ category, canEdit }: { category: Category; canEdit: boolean }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [error, setError] = useState<string | null>(null);
  const updateMutation = useUpdateCategory(category.id);
  const deleteMutation = useDeleteCategory();

  async function save() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === category.name) {
      setEditing(false);
      setName(category.name);
      return;
    }
    setError(null);
    try {
      await updateMutation.mutateAsync({ name: trimmed });
      setEditing(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to rename category");
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${category.name}"? Existing transactions keep their history but lose this category.`)) return;
    await deleteMutation.mutateAsync(category.id);
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2 py-1">
        {editing ? (
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                save();
              }
              if (e.key === "Escape") {
                setEditing(false);
                setName(category.name);
              }
            }}
            className="h-8 text-sm"
          />
        ) : (
          <span className="text-sm text-neutral-800">{category.name}</span>
        )}

        {canEdit && !editing && (
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded p-1 text-neutral-400 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function AddCategoryRow({ kind }: { kind: CategoryKind }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const createMutation = useCreateCategory();

  async function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setError(null);
    try {
      await createMutation.mutateAsync({ name: trimmed, kind });
      setName("");
      setAdding(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add category");
    }
  }

  if (!adding) {
    return (
      <button
        type="button"
        onClick={() => setAdding(true)}
        className="mt-3 flex items-center gap-1.5 self-start text-sm font-medium text-indigo-600 hover:text-indigo-700"
      >
        <Plus className="h-4 w-4" />
        Add category
      </button>
    );
  }

  return (
    <div className="mt-3 flex flex-col gap-1.5">
      <div className="flex gap-2">
        <Input
          autoFocus
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button type="button" onClick={handleAdd} disabled={createMutation.isPending}>
          Add
        </Button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
