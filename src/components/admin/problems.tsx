"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from "lucide-react";
import AdminHeader from "./admin-header";
import {
  AdminDialog,
  AdminTable,
  api,
  ConfirmDelete,
  Field,
  iconButtonClass,
  SwitchField,
  Td,
  Th,
  toastError,
  toastSuccess,
  Tr,
  useAdminData,
} from "./admin-utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingState, ErrorState, EmptyState } from "@/components/site/states";
import type { ProblemPair } from "@/lib/types";

/* ---------------------------------------------------------------- */
/* Editor dialog                                                     */
/* ---------------------------------------------------------------- */

interface PairFormState {
  problemTitle: string;
  problemDesc: string;
  solutionTitle: string;
  solutionDesc: string;
  displayOrder: string;
  isActive: boolean;
}

function PairDialog({
  item,
  fallbackOrder,
  onClose,
  onSaved,
}: {
  item: ProblemPair | null;
  /** Suggested displayOrder for a new pair (max existing + 1). */
  fallbackOrder: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = React.useState<PairFormState>({
    problemTitle: item?.problemTitle ?? "",
    problemDesc: item?.problemDesc ?? "",
    solutionTitle: item?.solutionTitle ?? "",
    solutionDesc: item?.solutionDesc ?? "",
    displayOrder: item !== null ? String(item.displayOrder) : String(fallbackOrder),
    isActive: item?.isActive ?? true,
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (form.problemTitle.trim().length < 2) {
      next.problemTitle = "Problem title must be at least 2 characters.";
    }
    if (form.problemTitle.trim().length > 200) {
      next.problemTitle = "Problem title must be at most 200 characters.";
    }
    if (form.problemDesc.trim().length < 5) {
      next.problemDesc = "Problem description must be at least 5 characters.";
    }
    if (form.solutionTitle.trim().length < 2) {
      next.solutionTitle = "Solution title must be at least 2 characters.";
    }
    if (form.solutionTitle.trim().length > 200) {
      next.solutionTitle = "Solution title must be at most 200 characters.";
    }
    if (form.solutionDesc.trim().length < 5) {
      next.solutionDesc = "Solution description must be at least 5 characters.";
    }
    if (form.displayOrder !== "" && !Number.isInteger(Number(form.displayOrder))) {
      next.displayOrder = "Display order must be a whole number.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        problemTitle: form.problemTitle.trim(),
        problemDesc: form.problemDesc.trim(),
        solutionTitle: form.solutionTitle.trim(),
        solutionDesc: form.solutionDesc.trim(),
        displayOrder:
          form.displayOrder === "" ? fallbackOrder : Number(form.displayOrder),
        isActive: form.isActive,
      };
      if (item === null) {
        await api("/api/admin/problems", "POST", payload);
        toastSuccess("Pair created");
      } else {
        await api(`/api/admin/problems/${item.id}`, "PUT", payload);
        toastSuccess("Changes saved");
      }
      onSaved();
      onClose();
    } catch (e) {
      toastError(
        item === null ? "Could not create pair." : "Could not save changes.",
        e instanceof Error ? e.message : undefined
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={item === null ? "New Pair" : "Edit Pair"}
      description="A problem and its engineered solution — rendered in the homepage “Problem Solving” section."
      submitting={submitting}
      submitLabel={item === null ? "Create Pair" : "Save Changes"}
      onSubmit={submit}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Problem Title" required error={errors.problemTitle}>
          <Input
            value={form.problemTitle}
            onChange={(e) => setForm({ ...form, problemTitle: e.target.value })}
            placeholder="Manual processes that don't scale"
            className="h-10 border-hairline focus-visible:ring-electric"
          />
        </Field>
        <Field label="Solution Title" required error={errors.solutionTitle}>
          <Input
            value={form.solutionTitle}
            onChange={(e) => setForm({ ...form, solutionTitle: e.target.value })}
            placeholder="Practical process software"
            className="h-10 border-hairline focus-visible:ring-electric"
          />
        </Field>
        <Field label="Problem Description" required error={errors.problemDesc}>
          <Textarea
            value={form.problemDesc}
            onChange={(e) => setForm({ ...form, problemDesc: e.target.value })}
            rows={3}
            className="border-hairline focus-visible:ring-electric"
          />
        </Field>
        <Field label="Solution Description" required error={errors.solutionDesc}>
          <Textarea
            value={form.solutionDesc}
            onChange={(e) => setForm({ ...form, solutionDesc: e.target.value })}
            rows={3}
            className="border-hairline focus-visible:ring-electric"
          />
        </Field>
        <Field
          label="Display Order"
          error={errors.displayOrder}
          hint="Lower sorts first on the homepage."
        >
          <Input
            type="number"
            value={form.displayOrder}
            onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
            placeholder={String(fallbackOrder)}
            className="h-10 border-hairline focus-visible:ring-electric"
          />
        </Field>
        <div className="self-end">
          <SwitchField
            label="Active"
            hint="Inactive pairs are hidden from the homepage."
            checked={form.isActive}
            onCheckedChange={(v) => setForm({ ...form, isActive: v })}
          />
        </div>
      </div>
    </AdminDialog>
  );
}

/* ---------------------------------------------------------------- */
/* Status badge                                                      */
/* ---------------------------------------------------------------- */

function PairStatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={
        active
          ? "inline-flex items-center rounded-full border border-emerald-700/25 bg-emerald-50 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-emerald-700"
          : "inline-flex items-center rounded-full border border-hairline bg-white px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft"
      }
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

/* ---------------------------------------------------------------- */
/* Section                                                           */
/* ---------------------------------------------------------------- */

export default function ProblemsSection() {
  const admin = useAdminData<ProblemPair[]>("/api/admin/problems");
  const [dialog, setDialog] = React.useState<{
    item: ProblemPair | null;
    key: string;
  } | null>(null);

  const pairs = admin.data ?? [];
  const nextOrder =
    pairs.length > 0 ? Math.max(...pairs.map((p) => p.displayOrder)) + 1 : 1;

  const remove = async (pair: ProblemPair) => {
    try {
      await api(`/api/admin/problems/${pair.id}`, "DELETE");
      toastSuccess(`Deleted "${pair.problemTitle}".`);
      admin.refresh();
    } catch (e) {
      toastError(
        "Could not delete pair.",
        e instanceof Error ? e.message : undefined
      );
    }
  };

  /**
   * Move a pair up/down one row by swapping its displayOrder with the
   * neighbour's (two PUTs). When both share the same order value, the
   * neighbour is nudged +1 so the swap actually re-sorts.
   */
  const move = async (index: number, direction: -1 | 1) => {
    const pair = pairs[index];
    const neighbour = pairs[index + direction];
    if (!pair || !neighbour) return;
    const pairOrder = pair.displayOrder;
    const neighbourOrder = neighbour.displayOrder;
    const pairNext =
      pairOrder === neighbourOrder ? pairOrder : neighbourOrder;
    const neighbourNext =
      pairOrder === neighbourOrder ? neighbourOrder + 1 : pairOrder;
    try {
      await api(`/api/admin/problems/${pair.id}`, "PUT", {
        displayOrder: pairNext,
      });
      await api(`/api/admin/problems/${neighbour.id}`, "PUT", {
        displayOrder: neighbourNext,
      });
      toastSuccess("Order updated");
      admin.refresh();
    } catch (e) {
      toastError(
        "Could not reorder pairs.",
        e instanceof Error ? e.message : undefined
      );
    }
  };

  return (
    <div>
      <AdminHeader
        section="Problems"
        title="Problem Solving"
        description="Homepage problem–solution pairs — the “04 / Problem Solving” section shows active pairs in display order, and hides entirely when none are active."
        action={
          <button
            type="button"
            onClick={() => setDialog({ item: null, key: `new-${Date.now()}` })}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-graphite px-5 text-sm font-medium text-white transition-colors hover:bg-[#23262D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
          >
            <Plus className="size-4" />
            New Pair
          </button>
        }
      />

      {admin.loading ? <LoadingState label="Loading pairs" /> : null}

      {!admin.loading && admin.error ? (
        <ErrorState message={admin.error} onRetry={admin.refresh} />
      ) : null}

      {!admin.loading && !admin.error && pairs.length === 0 ? (
        <EmptyState
          title="No pairs yet."
          description="Add the first problem–solution pair to power the homepage section."
        />
      ) : null}

      {!admin.loading && !admin.error && pairs.length > 0 ? (
        <AdminTable>
          <thead>
            <tr className="border-b border-hairline">
              <Th>Pair</Th>
              <Th className="text-center">Order</Th>
              <Th className="text-center">Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((pair, index) => (
              <Tr key={pair.id}>
                <Td>
                  <div className="flex max-w-md flex-col">
                    <span className="font-medium text-graphite">
                      {pair.problemTitle}
                    </span>
                    <span className="mt-0.5 truncate text-sm text-ink-soft">
                      <span aria-hidden="true" className="text-electric">
                        →{" "}
                      </span>
                      {pair.solutionTitle}
                    </span>
                  </div>
                </Td>
                <Td className="text-center">
                  <span className="font-mono text-[11px] text-ink-soft">
                    {String(pair.displayOrder).padStart(2, "0")}
                  </span>
                </Td>
                <Td className="text-center">
                  <PairStatusBadge active={pair.isActive} />
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      aria-label={`Move "${pair.problemTitle}" up`}
                      title="Move up"
                      disabled={index === 0}
                      onClick={() => void move(index, -1)}
                      className={iconButtonClass}
                    >
                      <ChevronUp className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Move "${pair.problemTitle}" down`}
                      title="Move down"
                      disabled={index === pairs.length - 1}
                      onClick={() => void move(index, 1)}
                      className={iconButtonClass}
                    >
                      <ChevronDown className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Edit "${pair.problemTitle}"`}
                      className={iconButtonClass}
                      onClick={() =>
                        setDialog({ item: pair, key: `edit-${pair.id}` })
                      }
                    >
                      <Pencil className="size-4" />
                    </button>
                    <ConfirmDelete
                      label={
                        "The homepage ‘Problem Solving’ section shows active pairs only — and hides entirely when none remain."
                      }
                      onConfirm={() => remove(pair)}
                    >
                      <button
                        type="button"
                        aria-label={`Delete "${pair.problemTitle}"`}
                        className={iconButtonClass}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </ConfirmDelete>
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </AdminTable>
      ) : null}

      {dialog ? (
        <PairDialog
          key={dialog.key}
          item={dialog.item}
          fallbackOrder={nextOrder}
          onClose={() => setDialog(null)}
          onSaved={admin.refresh}
        />
      ) : null}
    </div>
  );
}
