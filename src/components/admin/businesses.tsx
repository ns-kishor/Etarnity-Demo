"use client";

import * as React from "react";
import { Pencil, Plus, Star } from "lucide-react";
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
import type { Business, RelationshipType, OperationalStatus } from "@/lib/types";

const RELATIONSHIP_TYPES: RelationshipType[] = [
  "OWNED",
  "SUBSIDIARY",
  "OPERATED_BRAND",
  "PARTNER",
  "CLIENT_PROJECT",
  "PLANNED_INITIATIVE",
];

const OPERATIONAL_STATUSES: OperationalStatus[] = [
  "ACTIVE",
  "IN_DEVELOPMENT",
  "PLANNED",
  "ARCHIVED",
];

const CATEGORY_SUGGESTIONS = [
  "Product Design & Engineering",
  "Applied Intelligence",
  "Commerce",
  "Infrastructure",
];

/* ---------------------------------------------------------------- */
/* Dialog form                                                        */
/* ---------------------------------------------------------------- */

interface BusinessFormState {
  name: string;
  slug: string;
  summary: string;
  description: string;
  category: string;
  relationshipType: RelationshipType;
  operationalStatus: OperationalStatus;
  websiteUrl: string;
  displayOrder: string;
  isFeatured: boolean;
  isPublished: boolean;
  logoMediaId: number | null;
}

function BusinessDialog({
  item,
  initialPublished,
  onClose,
  onSaved,
}: {
  item: Business | null;
  initialPublished: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = React.useState<BusinessFormState>({
    name: item?.name ?? "",
    slug: item?.slug ?? "",
    summary: item?.summary ?? "",
    description: item?.description ?? "",
    category: item?.category ?? "",
    relationshipType: item?.relationshipType ?? "OWNED",
    operationalStatus: item?.operationalStatus ?? "IN_DEVELOPMENT",
    websiteUrl: item?.websiteUrl ?? "",
    displayOrder: "",
    isFeatured: item?.isFeatured ?? false,
    isPublished: initialPublished,
    logoMediaId: item?.logo?.id ?? null,
  });
  // The API list shape doesn't expose displayOrder — only send it when the
  // user actually edits the field (PUT is partial; absent keys stay put).
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
    if (form.summary.trim().length < 10) {
      next.summary = "Summary must be at least 10 characters.";
    }
    if (form.summary.trim().length > 500) {
      next.summary = "Summary must be at most 500 characters.";
    }
    if (form.category.trim().length < 2) {
      next.category = "Category is required.";
    }
    if (!isValidUrl(form.websiteUrl)) {
      next.websiteUrl = "Please provide a valid URL (or leave empty).";
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
        name: form.name.trim(),
        slug: form.slug,
        summary: form.summary.trim(),
        description: form.description.trim() === "" ? null : form.description,
        category: form.category.trim(),
        relationshipType: form.relationshipType,
        operationalStatus: form.operationalStatus,
        websiteUrl: form.websiteUrl.trim() === "" ? null : form.websiteUrl.trim(),
        isFeatured: form.isFeatured,
        isPublished: form.isPublished,
        logoMediaId: form.logoMediaId,
      };
      if (item === null || orderTouched) {
        payload.displayOrder = form.displayOrder === "" ? 0 : Number(form.displayOrder);
      }
      if (item === null) {
        await api("/api/admin/businesses", "POST", payload);
        toastSuccess("Business created");
      } else {
        await api(`/api/admin/businesses/${item.id}`, "PUT", payload);
        toastSuccess("Changes saved");
      }
      onSaved();
      onClose();
    } catch (e) {
      toastError(
        item === null ? "Could not create business." : "Could not save changes.",
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
      title={item === null ? "Add Business" : `Edit ${item.name}`}
      description="Ecosystem entry — appears on the public Businesses page when published."
      submitting={submitting}
      submitLabel={item === null ? "Create Business" : "Save Changes"}
      onSubmit={submit}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" required error={errors.name}>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Etar AI"
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
            placeholder="etar-ai"
            className="h-10 border-hairline font-mono text-[13px] focus-visible:ring-electric"
          />
        </Field>
        <Field
          label="Summary"
          required
          error={errors.summary}
          className="sm:col-span-2"
          hint="10–500 characters — shows in directory cards."
        >
          <Textarea
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            rows={3}
            placeholder="One sentence about what this business is and does."
            className="border-hairline focus-visible:ring-electric"
          />
        </Field>
        <Field label="Description" hint="Optional — detail page body." className="sm:col-span-2">
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={5}
            placeholder="Full description (plain paragraphs, blank line between)."
            className="border-hairline focus-visible:ring-electric"
          />
        </Field>
        <Field label="Category" required error={errors.category}>
          <Input
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder={CATEGORY_SUGGESTIONS[0]}
            list="business-categories"
            className="h-10 border-hairline focus-visible:ring-electric"
          />
          <datalist id="business-categories">
            {CATEGORY_SUGGESTIONS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <Field label="Website URL" error={errors.websiteUrl} hint="Optional">
          <Input
            value={form.websiteUrl}
            onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
            placeholder="https://…"
            className="h-10 border-hairline focus-visible:ring-electric"
          />
        </Field>
        <Field label="Relationship" required>
          <Select
            value={form.relationshipType}
            onValueChange={(v) =>
              setForm({ ...form, relationshipType: v as RelationshipType })
            }
          >
            <SelectTrigger className="h-10 w-full border-hairline bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RELATIONSHIP_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Operational Status" required>
          <Select
            value={form.operationalStatus}
            onValueChange={(v) =>
              setForm({ ...form, operationalStatus: v as OperationalStatus })
            }
          >
            <SelectTrigger className="h-10 w-full border-hairline bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OPERATIONAL_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            label="Logo"
            value={form.logoMediaId}
            onChange={(id) => setForm({ ...form, logoMediaId: id })}
          />
        </div>
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

export default function BusinessesSection() {
  const admin = useAdminData<Business[]>("/api/admin/businesses");
  const pub = useApi<Business[]>("/api/public/businesses");

  // Publish state isn't part of the admin list shape — derive it from the
  // public list (public rows are exactly the published ones).
  const publishedSlugs = React.useMemo(
    () => new Set((pub.data ?? []).map((b) => b.slug)),
    [pub.data]
  );

  const [dialog, setDialog] = React.useState<{
    item: Business | null;
    key: string;
  } | null>(null);

  const refreshAll = () => {
    admin.refresh();
    pub.refresh();
};

  const togglePublished = async (business: Business) => {
    const next = !publishedSlugs.has(business.slug);
    try {
      await api(`/api/admin/businesses/${business.id}`, "PUT", {
        isPublished: next,
      });
      toastSuccess(next ? "Business published" : "Business unpublished");
      refreshAll();
    } catch (e) {
      toastError(
        "Could not update publish state.",
        e instanceof Error ? e.message : undefined
      );
    }
  };

  const remove = async (business: Business) => {
    try {
      await api(`/api/admin/businesses/${business.id}`, "DELETE");
      toastSuccess(`Deleted "${business.name}".`);
      refreshAll();
    } catch (e) {
      toastError(
        "Could not delete business.",
        e instanceof Error ? e.message : undefined
      );
    }
  };

  return (
    <div>
      <AdminHeader
        section="Businesses"
        title="Businesses"
        description="The ETARNITY ecosystem — owned companies, operated brands, partners and planned initiatives."
        action={
          <button
            type="button"
            onClick={() => setDialog({ item: null, key: `new-${Date.now()}` })}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-graphite px-5 text-sm font-medium text-white transition-colors hover:bg-[#23262D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
          >
            <Plus className="size-4" />
            Add Business
          </button>
        }
      />

      {admin.loading ? <LoadingState label="Loading businesses" /> : null}

      {!admin.loading && admin.error ? (
        <ErrorState message={admin.error} onRetry={admin.refresh} />
      ) : null}

      {!admin.loading && !admin.error && (admin.data ?? []).length === 0 ? (
        <EmptyState
          title="No businesses yet."
          description="Add the first ecosystem entry to get started."
        />
      ) : null}

      {!admin.loading && !admin.error && (admin.data ?? []).length > 0 ? (
        <AdminTable>
          <thead>
            <tr className="border-b border-hairline">
              <Th>Business</Th>
              <Th>Category</Th>
              <Th>Relationship</Th>
              <Th>Status</Th>
              <Th className="text-center">Featured</Th>
              <Th className="text-center">Published</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {(admin.data ?? []).map((business) => (
              <Tr key={business.id}>
                <Td>
                  <div className="flex flex-col">
                    <span className="font-medium text-graphite">{business.name}</span>
                    <span className="font-mono text-[11px] text-ink-soft">
                      /{business.slug}
                    </span>
                  </div>
                </Td>
                <Td className="text-ink-soft">{business.category}</Td>
                <Td>
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">
                    {business.relationshipType.replace(/_/g, " ")}
                  </span>
                </Td>
                <Td>
                  <StatusChip status={business.operationalStatus} />
                </Td>
                <Td className="text-center">
                  {business.isFeatured ? (
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
                    checked={publishedSlugs.has(business.slug)}
                    onCheckedChange={() => void togglePublished(business)}
                    aria-label={`Toggle published for ${business.name}`}
                  />
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      aria-label={`Edit ${business.name}`}
                      className={iconButtonClass}
                      onClick={() =>
                        setDialog({ item: business, key: `edit-${business.id}` })
                      }
                    >
                      <Pencil className="size-4" />
                    </button>
                    <DeleteButton
                      ariaLabel={`Delete ${business.name}`}
                      onConfirm={() => remove(business)}
                    />
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </AdminTable>
      ) : null}

      {dialog ? (
        <BusinessDialog
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
