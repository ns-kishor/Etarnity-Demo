"use client";

import * as React from "react";
import { Check, Pencil, Plus, Star } from "lucide-react";
import AdminHeader from "./admin-header";
import {
  AdminDialog,
  AdminTable,
  api,
  DeleteButton,
  Field,
  iconButtonClass,
  isValidSlug,
  isValidUrl,
  MediaPickerField,
  slugify,
  splitList,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { LoadingState, ErrorState, EmptyState } from "@/components/site/states";
import { StatusChip } from "@/components/site/status-chip";
import { useApi } from "@/hooks/use-api";
import type {
  MediaItem,
  OwnershipType,
  Project,
  ProjectStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const OWNERSHIP_TYPES: OwnershipType[] = [
  "INTERNAL_PRODUCT",
  "CLIENT_PROJECT",
  "DEMONSTRATION",
  "EXPERIMENT",
  "PERSONAL_PROJECT",
];

const PROJECT_STATUSES: ProjectStatus[] = [
  "LIVE",
  "IN_DEVELOPMENT",
  "MAINTENANCE",
  "ARCHIVED",
];

/* ---------------------------------------------------------------- */
/* Gallery multi-select                                               */
/* ---------------------------------------------------------------- */

function GalleryPicker({
  value,
  onChange,
}: {
  value: number[];
  onChange: (ids: number[]) => void;
}) {
  const { data: media } = useApi<MediaItem[]>("/api/admin/media");
  const items = media ?? [];

  const toggle = (id: number) => {
    onChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id]
    );
  };

  if (items.length === 0) {
    return (
      <p className="text-xs text-ink-soft">
        No media uploaded yet — add images on the Media page (or upload above).
      </p>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {items.map((item) => {
        const selected = value.includes(item.id);
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => toggle(item.id)}
            aria-pressed={selected}
            aria-label={`${selected ? "Remove" : "Add"} ${item.fileName} ${
              selected ? "from" : "to"
            } gallery`}
            className={cn(
              "relative h-16 w-24 shrink-0 overflow-hidden rounded-md border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2",
              selected
                ? "border-electric ring-2 ring-electric"
                : "border-hairline opacity-70 hover:opacity-100"
            )}
          >
            <img
              src={item.url}
              alt={item.altText ?? item.fileName}
              className="h-full w-full object-cover"
            />
            {selected ? (
              <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-electric text-white">
                <Check className="size-3" />
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Dialog form                                                        */
/* ---------------------------------------------------------------- */

interface ProjectFormState {
  title: string;
  slug: string;
  summary: string;
  problem: string;
  solution: string;
  process: string;
  outcomes: string;
  stack: string;
  category: string;
  ownershipType: OwnershipType;
  projectStatus: ProjectStatus;
  liveUrl: string;
  displayOrder: string;
  isFeatured: boolean;
  isPublished: boolean;
  coverMediaId: number | null;
  galleryMediaIds: number[];
}

function ProjectDialog({
  item,
  initialPublished,
  onClose,
  onSaved,
}: {
  item: Project | null;
  initialPublished: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = React.useState<ProjectFormState>({
    title: item?.title ?? "",
    slug: item?.slug ?? "",
    summary: item?.summary ?? "",
    problem: item?.problem ?? "",
    solution: item?.solution ?? "",
    process: item?.process ?? "",
    outcomes: item?.outcomes ?? "",
    stack: (item?.stack ?? []).join(", "),
    category: item?.category ?? "",
    ownershipType: item?.ownershipType ?? "INTERNAL_PRODUCT",
    projectStatus: item?.projectStatus ?? "IN_DEVELOPMENT",
    liveUrl: item?.liveUrl ?? "",
    displayOrder: "",
    isFeatured: item?.isFeatured ?? false,
    isPublished: initialPublished,
    coverMediaId: item?.cover?.id ?? null,
    galleryMediaIds: (item?.gallery ?? []).map((g) => g.id),
  });
  const [orderTouched, setOrderTouched] = React.useState(false);
  const [slugTouched, setSlugTouched] = React.useState(item !== null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!slugTouched && form.title) {
      setForm((prev) => ({ ...prev, slug: slugify(prev.title) }));
    }
  }, [form.title, slugTouched]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (form.title.trim().length < 2) next.title = "Title must be at least 2 characters.";
    if (!isValidSlug(form.slug)) {
      next.slug =
        "Slug may only contain lowercase letters, numbers and hyphens (min 2 chars).";
    }
    if (form.summary.trim().length < 10) {
      next.summary = "Summary must be at least 10 characters.";
    }
    if (form.category.trim().length < 2) {
      next.category = "Category is required.";
    }
    if (!isValidUrl(form.liveUrl)) {
      next.liveUrl = "Please provide a valid URL (or leave empty).";
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
      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        slug: form.slug,
        summary: form.summary.trim(),
        problem: form.problem.trim() === "" ? null : form.problem,
        solution: form.solution.trim() === "" ? null : form.solution,
        process: form.process.trim() === "" ? null : form.process,
        outcomes: form.outcomes.trim() === "" ? null : form.outcomes,
        stack: splitList(form.stack),
        category: form.category.trim(),
        ownershipType: form.ownershipType,
        projectStatus: form.projectStatus,
        liveUrl: form.liveUrl.trim() === "" ? null : form.liveUrl.trim(),
        isFeatured: form.isFeatured,
        isPublished: form.isPublished,
        coverMediaId: form.coverMediaId,
        galleryMediaIds: form.galleryMediaIds,
      };
      if (item === null || orderTouched) {
        payload.displayOrder = form.displayOrder === "" ? 0 : Number(form.displayOrder);
      }
      if (item === null) {
        await api("/api/admin/projects", "POST", payload);
        toastSuccess("Project created");
      } else {
        await api(`/api/admin/projects/${item.id}`, "PUT", payload);
        toastSuccess("Changes saved");
      }
      onSaved();
      onClose();
    } catch (e) {
      toastError(
        item === null ? "Could not create project." : "Could not save changes.",
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
      title={item === null ? "Add Project" : `Edit ${item.title}`}
      description="Case study entry — appears on the public Work page when published."
      submitting={submitting}
      submitLabel={item === null ? "Create Project" : "Save Changes"}
      onSubmit={submit}
      wide
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" required error={errors.title}>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Atlas Design System"
            className="h-10 border-hairline focus-visible:ring-electric"
          />
        </Field>
        <Field label="Slug" required error={errors.slug} hint="Used in the URL">
          <Input
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              setForm({ ...form, slug: e.target.value });
            }}
            placeholder="atlas-design-system"
            className="h-10 border-hairline font-mono text-[13px] focus-visible:ring-electric"
          />
        </Field>
        <Field
          label="Summary"
          required
          error={errors.summary}
          className="sm:col-span-2"
          hint="10–500 characters."
        >
          <Textarea
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            rows={3}
            className="border-hairline focus-visible:ring-electric"
          />
        </Field>
        <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
          <Field label="Problem" hint="Optional — case study section.">
            <Textarea
              value={form.problem}
              onChange={(e) => setForm({ ...form, problem: e.target.value })}
              rows={4}
              className="border-hairline focus-visible:ring-electric"
            />
          </Field>
          <Field label="Solution" hint="Optional — case study section.">
            <Textarea
              value={form.solution}
              onChange={(e) => setForm({ ...form, solution: e.target.value })}
              rows={4}
              className="border-hairline focus-visible:ring-electric"
            />
          </Field>
          <Field label="Process" hint="Optional — case study section.">
            <Textarea
              value={form.process}
              onChange={(e) => setForm({ ...form, process: e.target.value })}
              rows={4}
              className="border-hairline focus-visible:ring-electric"
            />
          </Field>
          <Field label="Outcomes" hint="Optional — case study section.">
            <Textarea
              value={form.outcomes}
              onChange={(e) => setForm({ ...form, outcomes: e.target.value })}
              rows={4}
              className="border-hairline focus-visible:ring-electric"
            />
          </Field>
        </div>
        <Field
          label="Tech Stack"
          hint="Comma-separated, e.g. TypeScript, Next.js, Prisma"
        >
          <Input
            value={form.stack}
            onChange={(e) => setForm({ ...form, stack: e.target.value })}
            placeholder="TypeScript, Next.js, Prisma"
            className="h-10 border-hairline focus-visible:ring-electric"
          />
        </Field>
        <Field label="Category" required error={errors.category}>
          <Input
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="Design Systems"
            className="h-10 border-hairline focus-visible:ring-electric"
          />
        </Field>
        <Field label="Ownership" required>
          <Select
            value={form.ownershipType}
            onValueChange={(v) =>
              setForm({ ...form, ownershipType: v as OwnershipType })
            }
          >
            <SelectTrigger className="h-10 w-full border-hairline bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OWNERSHIP_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Project Status" required>
          <Select
            value={form.projectStatus}
            onValueChange={(v) =>
              setForm({ ...form, projectStatus: v as ProjectStatus })
            }
          >
            <SelectTrigger className="h-10 w-full border-hairline bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROJECT_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Live URL" error={errors.liveUrl} hint="Optional">
          <Input
            value={form.liveUrl}
            onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
            placeholder="https://…"
            className="h-10 border-hairline focus-visible:ring-electric"
          />
        </Field>
        <Field label="Display Order" error={errors.displayOrder} hint="Lower sorts first">
          <Input
            type="number"
            value={form.displayOrder}
            onChange={(e) => {
              setOrderTouched(true);
              setForm({ ...form, displayOrder: e.target.value });
            }}
            placeholder="0"
            className="h-10 border-hairline focus-visible:ring-electric"
          />
        </Field>
        <div className="sm:col-span-2">
          <MediaPickerField
            label="Cover Image"
            value={form.coverMediaId}
            onChange={(id) => setForm({ ...form, coverMediaId: id })}
          />
        </div>
        <Field
          label="Gallery"
          hint="Click thumbnails to include them in the project gallery."
          className="sm:col-span-2"
        >
          <GalleryPicker
            value={form.galleryMediaIds}
            onChange={(ids) => setForm({ ...form, galleryMediaIds: ids })}
          />
        </Field>
        <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
          <SwitchField
            label="Featured"
            hint="Highlighted placement"
            checked={form.isFeatured}
            onCheckedChange={(v) => setForm({ ...form, isFeatured: v })}
          />
          <SwitchField
            label="Published"
            hint="Visible on the public site"
            checked={form.isPublished}
            onCheckedChange={(v) => setForm({ ...form, isPublished: v })}
          />
        </div>
      </div>
    </AdminDialog>
  );
}

/* ---------------------------------------------------------------- */
/* Section                                                            */
/* ---------------------------------------------------------------- */

export default function ProjectsSection() {
  const admin = useAdminData<Project[]>("/api/admin/projects");
  const pub = useApi<Project[]>("/api/public/projects");

  const publishedSlugs = React.useMemo(
    () => new Set((pub.data ?? []).map((p) => p.slug)),
    [pub.data]
  );

  const [dialog, setDialog] = React.useState<{
    item: Project | null;
    key: string;
  } | null>(null);

  const refreshAll = () => {
    admin.refresh();
    pub.refresh();
};

  const togglePublished = async (project: Project) => {
    const next = !publishedSlugs.has(project.slug);
    try {
      await api(`/api/admin/projects/${project.id}`, "PUT", {
        isPublished: next,
      });
      toastSuccess(next ? "Project published" : "Project unpublished");
      refreshAll();
    } catch (e) {
      toastError(
        "Could not update publish state.",
        e instanceof Error ? e.message : undefined
      );
    }
  };

  const remove = async (project: Project) => {
    try {
      await api(`/api/admin/projects/${project.id}`, "DELETE");
      toastSuccess(`Deleted "${project.title}".`);
      refreshAll();
    } catch (e) {
      toastError(
        "Could not delete project.",
        e instanceof Error ? e.message : undefined
      );
    }
  };

  return (
    <div>
      <AdminHeader
        section="Projects"
        title="Projects"
        description="Case studies and products — internal, client, demonstration, experiment and personal work."
        action={
          <button
            type="button"
            onClick={() => setDialog({ item: null, key: `new-${Date.now()}` })}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-graphite px-5 text-sm font-medium text-white transition-colors hover:bg-[#23262D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
          >
            <Plus className="size-4" />
            Add Project
          </button>
        }
      />

      {admin.loading ? <LoadingState label="Loading projects" /> : null}

      {!admin.loading && admin.error ? (
        <ErrorState message={admin.error} onRetry={admin.refresh} />
      ) : null}

      {!admin.loading && !admin.error && (admin.data ?? []).length === 0 ? (
        <EmptyState
          title="No projects yet."
          description="Add the first project to get started."
        />
      ) : null}

      {!admin.loading && !admin.error && (admin.data ?? []).length > 0 ? (
        <AdminTable>
          <thead>
            <tr className="border-b border-hairline">
              <Th>Project</Th>
              <Th>Category</Th>
              <Th>Ownership</Th>
              <Th>Status</Th>
              <Th className="text-center">Featured</Th>
              <Th className="text-center">Published</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {(admin.data ?? []).map((project) => (
              <Tr key={project.id}>
                <Td>
                  <div className="flex flex-col">
                    <span className="font-medium text-graphite">{project.title}</span>
                    <span className="font-mono text-[11px] text-ink-soft">
                      /{project.slug}
                    </span>
                  </div>
                </Td>
                <Td className="text-ink-soft">{project.category}</Td>
                <Td>
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">
                    {project.ownershipType.replace(/_/g, " ")}
                  </span>
                </Td>
                <Td>
                  <StatusChip status={project.projectStatus} />
                </Td>
                <Td className="text-center">
                  {project.isFeatured ? (
                    <Star
                      className="mx-auto size-4 fill-[#B45309] text-[#B45309]"
                      aria-label="Featured"
                    />
                  ) : (
                    <Star
                      className="mx-auto size-4 text-hairline"
                      aria-label="Not featured"
                    />
                  )}
                </Td>
                <Td className="text-center">
                  <Switch
                    checked={publishedSlugs.has(project.slug)}
                    onCheckedChange={() => void togglePublished(project)}
                    aria-label={`Toggle published for ${project.title}`}
                  />
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      aria-label={`Edit ${project.title}`}
                      className={iconButtonClass}
                      onClick={() =>
                        setDialog({ item: project, key: `edit-${project.id}` })
                      }
                    >
                      <Pencil className="size-4" />
                    </button>
                    <DeleteButton
                      ariaLabel={`Delete ${project.title}`}
                      onConfirm={() => remove(project)}
                    />
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </AdminTable>
      ) : null}

      {dialog ? (
        <ProjectDialog
          key={dialog.key}
          item={dialog.item}
          initialPublished={
            dialog.item === null ? false : publishedSlugs.has(dialog.item.slug)
          }
          onClose={() => setDialog(null)}
          onSaved={refreshAll}
        />
      ) : null}
    </div>
  );
}
