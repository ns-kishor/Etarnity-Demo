"use client";

import * as React from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import AdminHeader from "./admin-header";
import {
  AdminDialog,
  AdminTable,
  api,
  DeleteButton,
  Field,
  iconButtonClass,
  isValidSlug,
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
import { Badge } from "@/components/ui/badge";
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
import { useApi } from "@/hooks/use-api";
import type { Person, PersonLink } from "@/lib/types";

const DEPARTMENTS = [
  "LEADERSHIP",
  "ENGINEERING",
  "DESIGN",
  "PRODUCT",
  "GROWTH",
  "SECURITY",
  "OPERATIONS",
  "RESEARCH",
] as const;

/* ---------------------------------------------------------------- */
/* Dialog form                                                        */
/* ---------------------------------------------------------------- */

interface PersonFormState {
  name: string;
  slug: string;
  position: string;
  department: string;
  biography: string;
  responsibilities: string;
  expertise: string;
  links: PersonLink[];
  isFounder: boolean;
  isPublic: boolean;
  displayOrder: string;
  profileMediaId: number | null;
}

function LinkRows({
  links,
  onChange,
}: {
  links: PersonLink[];
  onChange: (links: PersonLink[]) => void;
}) {
  const update = (index: number, patch: Partial<PersonLink>) => {
    onChange(links.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  };
  return (
    <div className="space-y-2">
      {links.map((link, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            value={link.label}
            onChange={(e) => update(index, { label: e.target.value })}
            placeholder="Label (LinkedIn)"
            aria-label={`Link ${index + 1} label`}
            className="h-9 w-36 border-hairline text-sm focus-visible:ring-electric"
          />
          <Input
            value={link.url}
            onChange={(e) => update(index, { url: e.target.value })}
            placeholder="https://…"
            aria-label={`Link ${index + 1} URL`}
            className="h-9 flex-1 border-hairline text-sm focus-visible:ring-electric"
          />
          <button
            type="button"
            aria-label={`Remove link ${index + 1}`}
            onClick={() => onChange(links.filter((_, i) => i !== index))}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-ink-soft transition-colors hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...links, { label: "", url: "" }])}
        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-hairline bg-white px-3 text-xs font-medium text-graphite transition-colors hover:border-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric"
      >
        <Plus className="size-3.5" />
        Add Link
      </button>
    </div>
  );
}

function PersonDialog({
  item,
  initialPublic,
  onClose,
  onSaved,
}: {
  item: Person | null;
  initialPublic: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = React.useState<PersonFormState>({
    name: item?.name ?? "",
    slug: item?.slug ?? "",
    position: item?.position ?? "",
    department: item?.department ?? "",
    biography: item?.biography ?? "",
    responsibilities: item?.responsibilities ?? "",
    expertise: (item?.expertise ?? []).join(", "),
    links: item?.links ?? [],
    isFounder: item?.isFounder ?? false,
    isPublic: initialPublic,
    displayOrder: "",
    profileMediaId: item?.portrait?.id ?? null,
  });
  const [orderTouched, setOrderTouched] = React.useState(false);
  const [slugTouched, setSlugTouched] = React.useState(item !== null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!slugTouched && form.name) {
      setForm((prev) => ({ ...prev, slug: slugify(prev.name) }));
    }
  }, [form.name, slugTouched]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = "Name must be at least 2 characters.";
    if (!isValidSlug(form.slug)) {
      next.slug =
        "Slug may only contain lowercase letters, numbers and hyphens (min 2 chars).";
    }
    if (form.position.trim().length < 2) {
      next.position = "Position must be at least 2 characters.";
    }
    if (form.displayOrder !== "" && !Number.isInteger(Number(form.displayOrder))) {
      next.displayOrder = "Display order must be a whole number.";
    }
    if (
      form.links.some(
        (l) => (l.label.trim() === "") !== (l.url.trim() === "")
      )
    ) {
      next.links = "Each link needs both a label and a URL (or remove the row).";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        slug: form.slug,
        position: form.position.trim(),
        department: form.department === "" ? null : form.department,
        biography: form.biography.trim() === "" ? null : form.biography,
        responsibilities:
          form.responsibilities.trim() === "" ? null : form.responsibilities,
        expertise: splitList(form.expertise),
        links: form.links
          .filter((l) => l.label.trim() !== "" && l.url.trim() !== "")
          .map((l) => ({ label: l.label.trim(), url: l.url.trim() })),
        isFounder: form.isFounder,
        isPublic: form.isPublic,
        profileMediaId: form.profileMediaId,
      };
      if (item === null || orderTouched) {
        payload.displayOrder = form.displayOrder === "" ? 0 : Number(form.displayOrder);
      }
      if (item === null) {
        await api("/api/admin/people", "POST", payload);
        toastSuccess("Person created");
      } else {
        await api(`/api/admin/people/${item.id}`, "PUT", payload);
        toastSuccess("Changes saved");
      }
      onSaved();
      onClose();
    } catch (e) {
      toastError(
        item === null ? "Could not create person." : "Could not save changes.",
        e instanceof Error ? e.message : undefined
      );
    } finally {
      setSubmitting(false);
    }
  };

  const departmentOptions = React.useMemo(() => {
    const current = form.department;
    if (current && !DEPARTMENTS.includes(current as (typeof DEPARTMENTS)[number])) {
      return [current, ...DEPARTMENTS];
    }
    return [...DEPARTMENTS];
  }, [form.department]);

  return (
    <AdminDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={item === null ? "Add Person" : `Edit ${item.name}`}
      description="Team member — appears on the public People page when public."
      submitting={submitting}
      submitLabel={item === null ? "Create Person" : "Save Changes"}
      onSubmit={submit}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" required error={errors.name}>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ayesha Rahman"
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
            placeholder="ayesha-rahman"
            className="h-10 border-hairline font-mono text-[13px] focus-visible:ring-electric"
          />
        </Field>
        <Field label="Position" required error={errors.position}>
          <Input
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
            placeholder="Founder & Chief Executive Officer"
            className="h-10 border-hairline focus-visible:ring-electric"
          />
        </Field>
        <Field label="Department" hint="Optional">
          <Select
            value={form.department}
            onValueChange={(v) =>
              setForm({ ...form, department: v === "none" ? "" : v })
            }
          >
            <SelectTrigger className="h-10 w-full border-hairline bg-white">
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— None —</SelectItem>
              {departmentOptions.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Biography" hint="Optional" className="sm:col-span-2">
          <Textarea
            value={form.biography}
            onChange={(e) => setForm({ ...form, biography: e.target.value })}
            rows={5}
            className="border-hairline focus-visible:ring-electric"
          />
        </Field>
        <Field label="Responsibilities" hint="Optional" className="sm:col-span-2">
          <Textarea
            value={form.responsibilities}
            onChange={(e) => setForm({ ...form, responsibilities: e.target.value })}
            rows={3}
            className="border-hairline focus-visible:ring-electric"
          />
        </Field>
        <Field label="Expertise" hint="Comma-separated" className="sm:col-span-2">
          <Input
            value={form.expertise}
            onChange={(e) => setForm({ ...form, expertise: e.target.value })}
            placeholder="Product strategy, Design systems"
            className="h-10 border-hairline focus-visible:ring-electric"
          />
        </Field>
        <Field label="Links" error={errors.links} className="sm:col-span-2">
          <LinkRows
            links={form.links}
            onChange={(links) => setForm({ ...form, links })}
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
            label="Portrait"
            value={form.profileMediaId}
            onChange={(id) => setForm({ ...form, profileMediaId: id })}
          />
        </div>
        <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
          <SwitchField
            label="Founder"
            hint="Featured in the founders section"
            checked={form.isFounder}
            onCheckedChange={(v) => setForm({ ...form, isFounder: v })}
          />
          <SwitchField
            label="Public"
            hint="Visible on the public site"
            checked={form.isPublic}
            onCheckedChange={(v) => setForm({ ...form, isPublic: v })}
          />
        </div>
      </div>
    </AdminDialog>
  );
}

/* ---------------------------------------------------------------- */
/* Section                                                            */
/* ---------------------------------------------------------------- */

export default function PeopleSection() {
  const admin = useAdminData<Person[]>("/api/admin/people");
  const pub = useApi<Person[]>("/api/public/people");

  // isPublic isn't part of the admin list shape — derive from the public list.
  const publicSlugs = React.useMemo(
    () => new Set((pub.data ?? []).map((p) => p.slug)),
    [pub.data]
  );

  const [dialog, setDialog] = React.useState<{
    item: Person | null;
    key: string;
  } | null>(null);

  const refreshAll = () => {
    admin.refresh();
    pub.refresh();
};

  const togglePublic = async (person: Person) => {
    const next = !publicSlugs.has(person.slug);
    try {
      await api(`/api/admin/people/${person.id}`, "PUT", { isPublic: next });
      toastSuccess(next ? "Person is now public" : "Person hidden from the site");
      refreshAll();
    } catch (e) {
      toastError(
        "Could not update visibility.",
        e instanceof Error ? e.message : undefined
      );
    }
  };

  const remove = async (person: Person) => {
    try {
      await api(`/api/admin/people/${person.id}`, "DELETE");
      toastSuccess(`Deleted "${person.name}".`);
      refreshAll();
    } catch (e) {
      toastError(
        "Could not delete person.",
        e instanceof Error ? e.message : undefined
      );
    }
  };

  return (
    <div>
      <AdminHeader
        section="People"
        title="People"
        description="Team members and founders — biographies, expertise and links."
        action={
          <button
            type="button"
            onClick={() => setDialog({ item: null, key: `new-${Date.now()}` })}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-graphite px-5 text-sm font-medium text-white transition-colors hover:bg-[#23262D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
          >
            <Plus className="size-4" />
            Add Person
          </button>
        }
      />

      {admin.loading ? <LoadingState label="Loading people" /> : null}

      {!admin.loading && admin.error ? (
        <ErrorState message={admin.error} onRetry={admin.refresh} />
      ) : null}

      {!admin.loading && !admin.error && (admin.data ?? []).length === 0 ? (
        <EmptyState
          title="No people yet."
          description="Add the first team member to get started."
        />
      ) : null}

      {!admin.loading && !admin.error && (admin.data ?? []).length > 0 ? (
        <AdminTable>
          <thead>
            <tr className="border-b border-hairline">
              <Th>Person</Th>
              <Th>Department</Th>
              <Th className="text-center">Founder</Th>
              <Th className="text-center">Public</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {(admin.data ?? []).map((person) => (
              <Tr key={person.id}>
                <Td>
                  <div className="flex flex-col">
                    <span className="font-medium text-graphite">{person.name}</span>
                    <span className="text-xs text-ink-soft">{person.position}</span>
                  </div>
                </Td>
                <Td>
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">
                    {person.department ?? "—"}
                  </span>
                </Td>
                <Td className="text-center">
                  {person.isFounder ? (
                    <Badge
                      variant="outline"
                      className="rounded-full border-electric/25 bg-electric/[0.06] font-mono text-[9px] uppercase tracking-[0.15em] text-electric"
                    >
                      Founder
                    </Badge>
                  ) : (
                    <span className="text-ink-soft">—</span>
                  )}
                </Td>
                <Td className="text-center">
                  <Switch
                    checked={publicSlugs.has(person.slug)}
                    onCheckedChange={() => void togglePublic(person)}
                    aria-label={`Toggle public visibility for ${person.name}`}
                  />
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      aria-label={`Edit ${person.name}`}
                      className={iconButtonClass}
                      onClick={() =>
                        setDialog({ item: person, key: `edit-${person.id}` })
                      }
                    >
                      <Pencil className="size-4" />
                    </button>
                    <DeleteButton
                      ariaLabel={`Delete ${person.name}`}
                      onConfirm={() => remove(person)}
                    />
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </AdminTable>
      ) : null}

      {dialog ? (
        <PersonDialog
          key={dialog.key}
          item={dialog.item}
          initialPublic={
            dialog.item === null ? true : publicSlugs.has(dialog.item.slug)
          }
          onClose={() => setDialog(null)}
          onSaved={refreshAll}
        />
      ) : null}
    </div>
  );
}
