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
  formatDate,
  iconButtonClass,
  isoToLocalInput,
  isValidSlug,
  localInputToIso,
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
import type { Article, ArticleStatus, Person } from "@/lib/types";
import { cn } from "@/lib/utils";

const ARTICLE_STATUSES: ArticleStatus[] = [
  "DRAFT",
  "SCHEDULED",
  "PUBLISHED",
  "ARCHIVED",
];

/* ---------------------------------------------------------------- */
/* Dialog form                                                        */
/* ---------------------------------------------------------------- */

interface ArticleFormState {
  title: string;
  slug: string;
  summary: string;
  body: string;
  category: string;
  status: ArticleStatus;
  publishedAt: string;
  authorId: string;
  isFeatured: boolean;
  coverMediaId: number | null;
}

function ArticleDialog({
  item,
  onClose,
  onSaved,
}: {
  item: Article | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { data: people } = useApi<Person[]>("/api/admin/people");

  const [form, setForm] = React.useState<ArticleFormState>({
    title: item?.title ?? "",
    slug: item?.slug ?? "",
    summary: item?.summary ?? "",
    body: item?.body ?? "",
    category: item?.category ?? "",
    status: item?.status ?? "DRAFT",
    publishedAt: isoToLocalInput(item?.publishedAt ?? null),
    authorId: item?.author ? String(item.author.id) : "",
    isFeatured: false,
    coverMediaId: item?.cover?.id ?? null,
  });
  const [slugTouched, setSlugTouched] = React.useState(item !== null);
  // isFeatured isn't part of the API list shape — only send it when the user
  // explicitly flips the switch, so editing never clobbers the stored value.
  const [featuredTouched, setFeaturedTouched] = React.useState(false);
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
    if (form.summary.trim().length > 400) {
      next.summary = "Summary must be at most 400 characters.";
    }
    if (form.body.trim() === "") next.body = "Body must not be empty.";
    if (form.category.trim().length < 2) {
      next.category = "Category is required.";
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
        body: form.body,
        category: form.category.trim(),
        status: form.status,
        publishedAt: localInputToIso(form.publishedAt),
        authorId: form.authorId === "" ? null : Number(form.authorId),
        coverMediaId: form.coverMediaId,
      };
      if (item === null || featuredTouched) {
        payload.isFeatured = form.isFeatured;
      }
      if (item === null) {
        await api("/api/admin/articles", "POST", payload);
        toastSuccess("Article created");
      } else {
        await api(`/api/admin/articles/${item.id}`, "PUT", payload);
        toastSuccess("Changes saved");
      }
      onSaved();
      onClose();
    } catch (e) {
      toastError(
        item === null ? "Could not create article." : "Could not save changes.",
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
      title={item === null ? "Add Article" : `Edit ${item.title}`}
      description="Insights post — renders with Markdown on the public site when published."
      submitting={submitting}
      submitLabel={item === null ? "Create Article" : "Save Changes"}
      onSubmit={submit}
      wide
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" required error={errors.title}>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="The Case for Boring Infrastructure"
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
            placeholder="the-case-for-boring-infrastructure"
            className="h-10 border-hairline font-mono text-[13px] focus-visible:ring-electric"
          />
        </Field>
        <Field
          label="Summary"
          required
          error={errors.summary}
          className="sm:col-span-2"
          hint="10–400 characters."
        >
          <Textarea
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            rows={3}
            className="border-hairline focus-visible:ring-electric"
          />
        </Field>
        <Field
          label="Body"
          required
          error={errors.body}
          hint="Markdown supported — ## headings, **bold**, lists, > quotes, code fences."
          className="sm:col-span-2"
        >
          <Textarea
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            rows={16}
            placeholder={"Opening paragraph…\n\n## Section heading\n\nSupporting detail."}
            className="border-hairline font-mono text-[13px] leading-relaxed focus-visible:ring-electric"
          />
        </Field>
        <Field label="Category" required error={errors.category}>
          <Input
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="Engineering"
            className="h-10 border-hairline focus-visible:ring-electric"
          />
        </Field>
        <Field
          label="Status"
          required
          hint="Publishing without a date stamps the current time."
        >
          <Select
            value={form.status}
            onValueChange={(v) => setForm({ ...form, status: v as ArticleStatus })}
          >
            <SelectTrigger className="h-10 w-full border-hairline bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ARTICLE_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Publish Date" hint="Optional — leave empty to auto-stamp on publish.">
          <Input
            type="datetime-local"
            value={form.publishedAt}
            onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
            className="h-10 border-hairline focus-visible:ring-electric"
          />
        </Field>
        <Field label="Author" hint="Optional — links the public author card.">
          <Select
            value={form.authorId}
            onValueChange={(v) =>
              setForm({ ...form, authorId: v === "none" ? "" : v })
            }
          >
            <SelectTrigger className="h-10 w-full border-hairline bg-white">
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— None —</SelectItem>
              {(people ?? []).map((person) => (
                <SelectItem key={person.id} value={String(person.id)}>
                  {person.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <div className="sm:col-span-2">
          <MediaPickerField
            label="Cover Image"
            value={form.coverMediaId}
            onChange={(id) => setForm({ ...form, coverMediaId: id })}
          />
        </div>
        <div className="sm:col-span-2">
          <SwitchField
            label="Featured"
            hint={
              item === null || featuredTouched
                ? "Highlighted in the Insights grid."
                : "Toggle to change — the current stored value isn't exposed until saved."
            }
            checked={form.isFeatured}
            onCheckedChange={(v) => {
              setFeaturedTouched(true);
              setForm({ ...form, isFeatured: v });
            }}
          />
        </div>
      </div>
    </AdminDialog>
  );
}

/* ---------------------------------------------------------------- */
/* Section                                                            */
/* ---------------------------------------------------------------- */

export default function ArticlesSection() {
  const admin = useAdminData<Article[]>("/api/admin/articles");

  const [dialog, setDialog] = React.useState<{
    item: Article | null;
    key: string;
  } | null>(null);

  // Client-side featured overrides (the API list shape has no isFeatured).
  // null = unknown (star rendered muted); clicking sets it explicitly.
  const [featured, setFeatured] = React.useState<Record<number, boolean>>({});

  const featuredState = (article: Article): boolean | null => {
    if (article.id in featured) return featured[article.id];
    return null;
  };

  const toggleFeatured = async (article: Article) => {
    const current = featuredState(article);
    const next = current === null ? true : !current;
    try {
      await api(`/api/admin/articles/${article.id}`, "PUT", {
        isFeatured: next,
      });
      setFeatured((prev) => ({ ...prev, [article.id]: next }));
      toastSuccess(next ? "Article featured" : "Article unfeatured");
    } catch (e) {
      toastError(
        "Could not update featured state.",
        e instanceof Error ? e.message : undefined
      );
    }
  };

  const togglePublished = async (article: Article) => {
    const next = article.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      await api(`/api/admin/articles/${article.id}`, "PUT", { status: next });
      toastSuccess(next === "PUBLISHED" ? "Article published" : "Article unpublished");
      admin.refresh();
    } catch (e) {
      toastError(
        "Could not update publish state.",
        e instanceof Error ? e.message : undefined
      );
    }
  };

  const remove = async (article: Article) => {
    try {
      await api(`/api/admin/articles/${article.id}`, "DELETE");
      toastSuccess(`Deleted "${article.title}".`);
      admin.refresh();
    } catch (e) {
      toastError(
        "Could not delete article.",
        e instanceof Error ? e.message : undefined
      );
    }
  };

  return (
    <div>
      <AdminHeader
        section="Articles"
        title="Articles"
        description="Insights posts — drafts, scheduled and published entries."
        action={
          <button
            type="button"
            onClick={() => setDialog({ item: null, key: `new-${Date.now()}` })}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-graphite px-5 text-sm font-medium text-white transition-colors hover:bg-[#23262D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
          >
            <Plus className="size-4" />
            Add Article
          </button>
        }
      />

      {admin.loading ? <LoadingState label="Loading articles" /> : null}

      {!admin.loading && admin.error ? (
        <ErrorState message={admin.error} onRetry={admin.refresh} />
      ) : null}

      {!admin.loading && !admin.error && (admin.data ?? []).length === 0 ? (
        <EmptyState
          title="No articles yet."
          description="Write the first Insights post to get started."
        />
      ) : null}

      {!admin.loading && !admin.error && (admin.data ?? []).length > 0 ? (
        <AdminTable>
          <thead>
            <tr className="border-b border-hairline">
              <Th>Article</Th>
              <Th>Category</Th>
              <Th>Status</Th>
              <Th>Author</Th>
              <Th>Published</Th>
              <Th className="text-center">Featured</Th>
              <Th className="text-center">Live</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {(admin.data ?? []).map((article) => {
              const isFeatured = featuredState(article);
              return (
                <Tr key={article.id}>
                  <Td>
                    <div className="flex max-w-[280px] flex-col">
                      <span className="truncate font-medium text-graphite">
                        {article.title}
                      </span>
                      <span className="truncate font-mono text-[11px] text-ink-soft">
                        /{article.slug}
                      </span>
                    </div>
                  </Td>
                  <Td className="text-ink-soft">{article.category}</Td>
                  <Td>
                    <StatusChip status={article.status} />
                  </Td>
                  <Td className="text-ink-soft">{article.author?.name ?? "—"}</Td>
                  <Td>
                    <span className="font-mono text-[11px] text-ink-soft">
                      {article.publishedAt ? formatDate(article.publishedAt) : "—"}
                    </span>
                  </Td>
                  <Td className="text-center">
                    <button
                      type="button"
                      onClick={() => void toggleFeatured(article)}
                      aria-label={
                        isFeatured === null
                          ? `Set featured for ${article.title}`
                          : `${isFeatured ? "Unfeature" : "Feature"} ${article.title}`
                      }
                      title={
                        isFeatured === null
                          ? "Set featured (current state unknown)"
                          : isFeatured
                            ? "Featured — click to unfeature"
                            : "Not featured — click to feature"
                      }
                      className="inline-flex size-8 items-center justify-center rounded-md transition-colors hover:bg-warmwhite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric"
                    >
                      <Star
                        className={cn(
                          "size-4",
                          isFeatured === true
                            ? "fill-[#B45309] text-[#B45309]"
                            : isFeatured === false
                              ? "text-ink-soft"
                              : "text-hairline"
                        )}
                      />
                    </button>
                  </Td>
                  <Td className="text-center">
                    <Switch
                      checked={article.status === "PUBLISHED"}
                      onCheckedChange={() => void togglePublished(article)}
                      aria-label={`Toggle published for ${article.title}`}
                    />
                  </Td>
                  <Td>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        aria-label={`Edit ${article.title}`}
                        className={iconButtonClass}
                        onClick={() =>
                          setDialog({ item: article, key: `edit-${article.id}` })
                        }
                      >
                        <Pencil className="size-4" />
                      </button>
                      <DeleteButton
                        ariaLabel={`Delete ${article.title}`}
                        onConfirm={() => remove(article)}
                      />
                    </div>
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </AdminTable>
      ) : null}

      {dialog ? (
        <ArticleDialog
          key={dialog.key}
          item={dialog.item}
          onClose={() => setDialog(null)}
          onSaved={admin.refresh}
        />
      ) : null}
    </div>
  );
}
