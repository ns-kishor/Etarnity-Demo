"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2 } from "lucide-react";
import AdminHeader from "./admin-header";
import {
  api,
  isValidEmail,
  toastError,
  toastSuccess,
  useAdminData,
} from "./admin-utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingState, ErrorState } from "@/components/site/states";
import type {
  CompanyProfile,
  Milestone,
  Principle,
} from "@/lib/types";

/* ---------------------------------------------------------------- */
/* Profile section                                                    */
/* ---------------------------------------------------------------- */

interface ProfileState {
  name: string;
  tagline: string;
  overview: string;
  mission: string;
  vision: string;
  foundingYear: string;
  headquarters: string;
  operatingStatus: string;
  contactEmail: string;
}

function profileFromData(profile: CompanyProfile | null): ProfileState {
  return {
    name: profile?.name ?? "",
    tagline: profile?.tagline ?? "",
    overview: profile?.overview ?? "",
    mission: profile?.mission ?? "",
    vision: profile?.vision ?? "",
    foundingYear:
      profile?.foundingYear !== null && profile?.foundingYear !== undefined
        ? String(profile.foundingYear)
        : "",
    headquarters: profile?.headquarters ?? "",
    operatingStatus: profile?.operatingStatus ?? "",
    contactEmail: profile?.contactEmail ?? "",
  };
}

function ProfileSection({
  profile,
  onSaved,
}: {
  profile: CompanyProfile | null;
  onSaved: () => void;
}) {
  const [form, setForm] = React.useState<ProfileState>(() =>
    profileFromData(profile)
  );
  const [saving, setSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const save = async () => {
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = "Name must be at least 2 characters.";
    if (form.foundingYear !== "" && !/^\d{4}$/.test(form.foundingYear.trim())) {
      next.foundingYear = "Founding year must be a 4-digit year.";
    }
    if (!isValidEmail(form.contactEmail)) {
      next.contactEmail = "Please provide a valid email (or leave empty).";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    try {
      await api("/api/admin/company", "PUT", {
        profile: {
          name: form.name.trim(),
          tagline: form.tagline.trim() === "" ? null : form.tagline.trim(),
          overview: form.overview.trim() === "" ? null : form.overview,
          mission: form.mission.trim() === "" ? null : form.mission,
          vision: form.vision.trim() === "" ? null : form.vision,
          foundingYear:
            form.foundingYear.trim() === "" ? null : Number(form.foundingYear),
          headquarters:
            form.headquarters.trim() === "" ? null : form.headquarters.trim(),
          operatingStatus:
            form.operatingStatus.trim() === "" ? null : form.operatingStatus.trim(),
          contactEmail:
            form.contactEmail.trim() === "" ? null : form.contactEmail.trim(),
        },
      });
      toastSuccess("Profile saved");
      onSaved();
    } catch (e) {
      toastError(
        "Could not save profile.",
        e instanceof Error ? e.message : undefined
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-xl border border-hairline bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-6 py-4">
        <div>
          <h2 className="text-base font-semibold text-graphite">Profile</h2>
          <p className="mt-1 text-xs text-ink-soft">
            Identity and narrative used across the public site.
          </p>
        </div>
        <SaveButton onClick={() => void save()} busy={saving} label="Save Profile" />
      </div>
      <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 sm:col-span-1">
          <FieldLabel required>Company Name</FieldLabel>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="ETARNITY"
            className="h-10 border-hairline focus-visible:ring-electric"
          />
          {errors.name ? <ErrorText>{errors.name}</ErrorText> : null}
        </label>
        <label className="flex flex-col gap-1.5">
          <FieldLabel>Tagline</FieldLabel>
          <Input
            value={form.tagline}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            placeholder="Building What Comes Next."
            className="h-10 border-hairline focus-visible:ring-electric"
          />
        </label>
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <FieldLabel>Overview</FieldLabel>
          <Textarea
            value={form.overview}
            onChange={(e) => setForm({ ...form, overview: e.target.value })}
            rows={6}
            placeholder="Company overview — the long narrative on the /company page."
            className="border-hairline focus-visible:ring-electric"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <FieldLabel>Mission</FieldLabel>
          <Textarea
            value={form.mission}
            onChange={(e) => setForm({ ...form, mission: e.target.value })}
            rows={3}
            className="border-hairline focus-visible:ring-electric"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <FieldLabel>Vision</FieldLabel>
          <Textarea
            value={form.vision}
            onChange={(e) => setForm({ ...form, vision: e.target.value })}
            rows={3}
            className="border-hairline focus-visible:ring-electric"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <FieldLabel>Founding Year</FieldLabel>
          <Input
            value={form.foundingYear}
            onChange={(e) => setForm({ ...form, foundingYear: e.target.value })}
            placeholder="2025"
            className="h-10 border-hairline focus-visible:ring-electric"
          />
          {errors.foundingYear ? <ErrorText>{errors.foundingYear}</ErrorText> : null}
        </label>
        <label className="flex flex-col gap-1.5">
          <FieldLabel>Headquarters</FieldLabel>
          <Input
            value={form.headquarters}
            onChange={(e) => setForm({ ...form, headquarters: e.target.value })}
            placeholder="Dhaka, Bangladesh"
            className="h-10 border-hairline focus-visible:ring-electric"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <FieldLabel>Operating Status</FieldLabel>
          <Input
            value={form.operatingStatus}
            onChange={(e) => setForm({ ...form, operatingStatus: e.target.value })}
            placeholder="Operating — early stage"
            className="h-10 border-hairline focus-visible:ring-electric"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <FieldLabel>Contact Email</FieldLabel>
          <Input
            type="email"
            value={form.contactEmail}
            onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
            placeholder="hello@etarnity.com"
            className="h-10 border-hairline focus-visible:ring-electric"
          />
          {errors.contactEmail ? <ErrorText>{errors.contactEmail}</ErrorText> : null}
        </label>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* Repeating editors (principles / milestones)                        */
/* ---------------------------------------------------------------- */

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <span className="font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-ink-soft">
      {children}
      {required ? <span className="ml-1 text-electric">*</span> : null}
    </span>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <span className="text-xs text-red-600">{children}</span>;
}

function SaveButton({
  onClick,
  busy,
  label,
  disabled,
}: {
  onClick: () => void;
  busy: boolean;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy || disabled}
      className="inline-flex h-9 items-center gap-2 rounded-full bg-graphite px-4 text-xs font-medium text-white transition-colors hover:bg-[#23262D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 disabled:opacity-50"
    >
      {busy ? <Loader2 className="size-3.5 animate-spin" /> : null}
      {busy ? "Saving…" : label}
    </button>
  );
}

function ReorderButtons({
  onUp,
  onDown,
  first,
  last,
}: {
  onUp: () => void;
  onDown: () => void;
  first: boolean;
  last: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onUp}
        disabled={first}
        aria-label="Move up"
        className="inline-flex size-8 items-center justify-center rounded-md border border-hairline bg-white text-ink-soft transition-colors hover:border-graphite hover:text-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric disabled:opacity-30"
      >
        <ArrowUp className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={onDown}
        disabled={last}
        aria-label="Move down"
        className="inline-flex size-8 items-center justify-center rounded-md border border-hairline bg-white text-ink-soft transition-colors hover:border-graphite hover:text-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric disabled:opacity-30"
      >
        <ArrowDown className="size-3.5" />
      </button>
    </div>
  );
}

function PrinciplesSection({
  principles,
  onSaved,
}: {
  principles: Principle[];
  onSaved: () => void;
}) {
  const [rows, setRows] = React.useState(
    principles.map((p) => ({ title: p.title, description: p.description }))
  );
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const save = async () => {
    const invalid = rows.find(
      (r) => r.title.trim().length < 2 || r.description.trim().length < 5
    );
    if (invalid) {
      setError("Each principle needs a title (2+ chars) and a description (5+ chars).");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await api("/api/admin/company", "PUT", {
        principles: rows.map((r) => ({
          title: r.title.trim(),
          description: r.description.trim(),
        })),
      });
      toastSuccess("Principles saved");
      onSaved();
    } catch (e) {
      toastError(
        "Could not save principles.",
        e instanceof Error ? e.message : undefined
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-xl border border-hairline bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-6 py-4">
        <div>
          <h2 className="text-base font-semibold text-graphite">Principles</h2>
          <p className="mt-1 text-xs text-ink-soft">
            “How we operate” on the company page — order follows this list.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRows([...rows, { title: "", description: "" }])}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-hairline bg-white px-4 text-xs font-medium text-graphite transition-colors hover:border-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
          >
            <Plus className="size-3.5" />
            Add Principle
          </button>
          <SaveButton
            onClick={() => void save()}
            busy={saving}
            label="Save Principles"
          />
        </div>
      </div>
      {error ? (
        <p className="px-6 pt-4 text-xs text-red-600">{error}</p>
      ) : null}
      <div className="space-y-4 px-6 py-5">
        {rows.length === 0 ? (
          <p className="text-sm text-ink-soft">
            No principles yet — add the first one.
          </p>
        ) : null}
        {rows.map((row, index) => (
          <div
            key={index}
            className="rounded-lg border border-hairline bg-warmwhite/40 p-4"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">
                {String(index + 1).padStart(2, "0")}
              </span>
              <Input
                value={row.title}
                onChange={(e) =>
                  setRows(
                    rows.map((r, i) =>
                      i === index ? { ...r, title: e.target.value } : r
                    )
                  )
                }
                placeholder="Principle title"
                aria-label={`Principle ${index + 1} title`}
                className="h-9 max-w-xs flex-1 border-hairline focus-visible:ring-electric"
              />
              <div className="ml-auto flex items-center gap-1">
                <ReorderButtons
                  first={index === 0}
                  last={index === rows.length - 1}
                  onUp={() => {
                    const next = [...rows];
                    [next[index - 1], next[index]] = [next[index], next[index - 1]];
                    setRows(next);
                  }}
                  onDown={() => {
                    const next = [...rows];
                    [next[index + 1], next[index]] = [next[index], next[index + 1]];
                    setRows(next);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setRows(rows.filter((_, i) => i !== index))}
                  aria-label={`Remove principle ${index + 1}`}
                  className="inline-flex size-8 items-center justify-center rounded-md text-ink-soft transition-colors hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
            <Textarea
              value={row.description}
              onChange={(e) =>
                setRows(
                  rows.map((r, i) =>
                    i === index ? { ...r, description: e.target.value } : r
                  )
                )
              }
              rows={3}
              placeholder="What this principle means in practice."
              aria-label={`Principle ${index + 1} description`}
              className="mt-3 border-hairline bg-white text-sm focus-visible:ring-electric"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function MilestonesSection({
  milestones,
  onSaved,
}: {
  milestones: Milestone[];
  onSaved: () => void;
}) {
  const [rows, setRows] = React.useState(
    milestones.map((m) => ({
      year: m.year,
      title: m.title,
      description: m.description,
    }))
  );
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const save = async () => {
    const invalid = rows.find(
      (r) =>
        r.year.trim().length < 2 ||
        r.title.trim().length < 2 ||
        r.description.trim().length < 5
    );
    if (invalid) {
      setError(
        "Each milestone needs a year (2+ chars), a title (2+ chars) and a description (5+ chars)."
      );
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await api("/api/admin/company", "PUT", {
        milestones: rows.map((r) => ({
          year: r.year.trim(),
          title: r.title.trim(),
          description: r.description.trim(),
        })),
      });
      toastSuccess("Milestones saved");
      onSaved();
    } catch (e) {
      toastError(
        "Could not save milestones.",
        e instanceof Error ? e.message : undefined
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-xl border border-hairline bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-6 py-4">
        <div>
          <h2 className="text-base font-semibold text-graphite">Milestones</h2>
          <p className="mt-1 text-xs text-ink-soft">
            Company journey timeline — order follows this list.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRows([...rows, { year: "", title: "", description: "" }])}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-hairline bg-white px-4 text-xs font-medium text-graphite transition-colors hover:border-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
          >
            <Plus className="size-3.5" />
            Add Milestone
          </button>
          <SaveButton
            onClick={() => void save()}
            busy={saving}
            label="Save Milestones"
          />
        </div>
      </div>
      {error ? <p className="px-6 pt-4 text-xs text-red-600">{error}</p> : null}
      <div className="space-y-4 px-6 py-5">
        {rows.length === 0 ? (
          <p className="text-sm text-ink-soft">
            No milestones yet — add the first one.
          </p>
        ) : null}
        {rows.map((row, index) => (
          <div
            key={index}
            className="rounded-lg border border-hairline bg-warmwhite/40 p-4"
          >
            <div className="flex flex-wrap items-center gap-3">
              <Input
                value={row.year}
                onChange={(e) =>
                  setRows(
                    rows.map((r, i) =>
                      i === index ? { ...r, year: e.target.value } : r
                    )
                  )
                }
                placeholder="2025"
                aria-label={`Milestone ${index + 1} year`}
                className="h-9 w-24 border-hairline font-mono text-sm focus-visible:ring-electric"
              />
              <Input
                value={row.title}
                onChange={(e) =>
                  setRows(
                    rows.map((r, i) =>
                      i === index ? { ...r, title: e.target.value } : r
                    )
                  )
                }
                placeholder="Company founded"
                aria-label={`Milestone ${index + 1} title`}
                className="h-9 min-w-[200px] flex-1 border-hairline focus-visible:ring-electric"
              />
              <div className="ml-auto flex items-center gap-1">
                <ReorderButtons
                  first={index === 0}
                  last={index === rows.length - 1}
                  onUp={() => {
                    const next = [...rows];
                    [next[index - 1], next[index]] = [next[index], next[index - 1]];
                    setRows(next);
                  }}
                  onDown={() => {
                    const next = [...rows];
                    [next[index + 1], next[index]] = [next[index], next[index + 1]];
                    setRows(next);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setRows(rows.filter((_, i) => i !== index))}
                  aria-label={`Remove milestone ${index + 1}`}
                  className="inline-flex size-8 items-center justify-center rounded-md text-ink-soft transition-colors hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
            <Textarea
              value={row.description}
              onChange={(e) =>
                setRows(
                  rows.map((r, i) =>
                    i === index ? { ...r, description: e.target.value } : r
                  )
                )
              }
              rows={3}
              placeholder="What happened."
              aria-label={`Milestone ${index + 1} description`}
              className="mt-3 border-hairline bg-white text-sm focus-visible:ring-electric"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* Section                                                            */
/* ---------------------------------------------------------------- */

interface CompanyPayload {
  profile: CompanyProfile | null;
}

export default function CompanySection() {
  const { data, loading, error, refresh } = useAdminData<CompanyPayload>(
    "/api/admin/company"
  );
  const [principlesKey, setPrinciplesKey] = React.useState(0);
  const [milestonesKey, setMilestonesKey] = React.useState(0);

  const profile = data?.profile ?? null;

  return (
    <div>
      <AdminHeader
        section="Company"
        title="Company"
        description="Profile, principles and milestones — the narrative content of the public site."
      />

      {loading ? <LoadingState label="Loading company" /> : null}

      {!loading && error ? <ErrorState message={error} onRetry={refresh} /> : null}

      {!loading && !error ? (
        <div className="space-y-6">
          <ProfileSection
            key={`profile-${profile?.name ?? "empty"}`}
            profile={profile}
            onSaved={refresh}
          />
          <PrinciplesSection
            key={`principles-${principlesKey}`}
            principles={profile?.principles ?? []}
            onSaved={() => {
              refresh();
              setPrinciplesKey((k) => k + 1);
            }}
          />
          <MilestonesSection
            key={`milestones-${milestonesKey}`}
            milestones={profile?.milestones ?? []}
            onSaved={() => {
              refresh();
              setMilestonesKey((k) => k + 1);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
