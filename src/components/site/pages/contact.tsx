"use client";

import * as React from "react";
import {
  Briefcase,
  CheckCircle2,
  Handshake,
  Loader2,
  MessageSquare,
  Newspaper,
  Package,
  UserPlus,
} from "lucide-react";
import { useApi } from "@/hooks/use-api";
import type { CompanyProfile, InquiryType } from "@/lib/types";
import { Link } from "@/lib/router";
import { cn } from "@/lib/utils";
import { PageHeader } from "../page-header";
import { Reveal } from "../reveal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { INQUIRY_TYPE_STORAGE_KEY } from "./careers";

/* ---------- Config ---------- */

const INQUIRY_TYPES: InquiryType[] = [
  "GENERAL",
  "BUSINESS",
  "PARTNERSHIP",
  "PRODUCT",
  "CAREERS",
  "PRESS",
];

const INQUIRY_CATEGORIES: {
  type: InquiryType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    type: "GENERAL",
    label: "General",
    description: "General questions about ETARNITY",
    icon: MessageSquare,
  },
  {
    type: "BUSINESS",
    label: "Business",
    description: "Projects, engagements, RFPs",
    icon: Briefcase,
  },
  {
    type: "PARTNERSHIP",
    label: "Partnership",
    description: "Strategic and product partnerships",
    icon: Handshake,
  },
  {
    type: "PRODUCT",
    label: "Product",
    description: "Questions about our products",
    icon: Package,
  },
  {
    type: "CAREERS",
    label: "Careers",
    description: "Working with us",
    icon: UserPlus,
  },
  {
    type: "PRESS",
    label: "Press",
    description: "Media and press",
    icon: Newspaper,
  },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormState {
  name: string;
  email: string;
  organization: string;
  inquiryType: InquiryType | "";
  subject: string;
  message: string;
  consent: boolean;
  website: string; // honeypot — must remain empty
}

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  organization: "",
  inquiryType: "",
  subject: "",
  message: "",
  consent: false,
  website: "",
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = "Please enter your full name.";
  if (!form.email.trim()) {
    errors.email = "Please enter your email address.";
  } else if (!EMAIL_PATTERN.test(form.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  if (!form.inquiryType) errors.inquiryType = "Please select an inquiry type.";
  if (!form.subject.trim()) errors.subject = "Please enter a subject.";
  if (form.message.trim().length < 10) {
    errors.message = "Please write a message of at least 10 characters.";
  }
  if (!form.consent) {
    errors.consent = "Please accept the privacy policy to continue.";
  }
  return errors;
}

/* ---------- Small presentational helpers ---------- */

function FieldLabel({
  htmlFor,
  text,
  required,
}: {
  htmlFor: string;
  text: string;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-graphite">
      {text}
      {required ? (
        <span className="ml-0.5 text-electric" aria-hidden="true">
          *
        </span>
      ) : null}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-xs text-red-600" role="alert">
      {message}
    </p>
  );
}

const inputClass = (invalid: boolean) =>
  cn(
    "h-11 w-full rounded-lg border bg-warmwhite px-4 text-sm text-graphite transition placeholder:text-ink-soft focus-visible:border-electric focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric",
    invalid ? "border-red-300" : "border-hairline"
  );

/* ---------- Page ---------- */

export default function ContactPage() {
  const { data: company } = useApi<CompanyProfile | null>("/api/public/company");
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [sending, setSending] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);

  const contactEmail = company?.contactEmail ?? "hello@etarnity.com";

  // Cross-page hand-off (e.g. Careers → "Introduce Yourself").
  React.useEffect(() => {
    try {
      const stored = sessionStorage.getItem(INQUIRY_TYPE_STORAGE_KEY);
      if (stored && INQUIRY_TYPES.includes(stored as InquiryType)) {
        setForm((current) => ({ ...current, inquiryType: stored as InquiryType }));
      }
      sessionStorage.removeItem(INQUIRY_TYPE_STORAGE_KEY);
    } catch {
      /* storage unavailable — default state stands */
    }
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) {
      setErrors((current) => ({ ...current, [key]: undefined }));
    }
  }

  function resetAll() {
    setForm(EMPTY_FORM);
    setErrors({});
    setServerError(null);
    setSent(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSending(true);
    setServerError(null);
    try {
      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          organization: form.organization.trim() || undefined,
          inquiryType: form.inquiryType,
          subject: form.subject.trim(),
          message: form.message.trim(),
          consent: true,
          website: form.website,
        }),
      });
      if (res.ok) {
        setSent(true);
        return;
      }
      if (res.status === 429) {
        setServerError("Too many messages. Please wait a moment and try again.");
      } else if (res.status === 400) {
        let message = "Please review the form and try again.";
        try {
          const body: unknown = await res.json();
          if (
            body &&
            typeof body === "object" &&
            typeof (body as { error?: unknown }).error === "string"
          ) {
            message = (body as { error: string }).error;
          }
        } catch {
          /* keep the default message */
        }
        setServerError(message);
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="06 / CONTACT"
        title="Start a Conversation."
        lede="Reach the right team — we route inquiries internally and respond within 2–3 business days."
      />

      <div className="container-site grid gap-12 pb-24 lg:grid-cols-12">
        {/* Left column — inquiry types + direct contact */}
        <div className="space-y-6 lg:col-span-4">
          <Reveal>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-electric">
                Inquiry Types
              </p>
              <ul className="mt-4 space-y-4">
                {INQUIRY_CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  return (
                    <li key={category.type} className="flex items-start gap-3">
                      <Icon
                        className="mt-0.5 size-4 shrink-0 text-electric"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-sm font-medium text-graphite">
                          {category.label}
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">
                          {category.description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="rounded-xl border border-hairline bg-white p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-electric">
                Direct
              </p>
              <a
                href={`mailto:${contactEmail}`}
                className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-electric underline-offset-4 transition hover:underline"
              >
                {contactEmail}
              </a>
              <p className="mt-2 text-xs uppercase text-ink-soft">
                Response within 2–3 business days
              </p>
            </div>
          </Reveal>
        </div>

        {/* Right column — the form */}
        <div className="lg:col-span-8">
          <Reveal delay={0.05}>
            <div className="rounded-2xl border border-hairline bg-white p-6 md:p-10">
              {sent ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <CheckCircle2
                    className="size-10 text-electric"
                    aria-hidden="true"
                  />
                  <h2 className="mt-6 text-xl font-semibold text-graphite">
                    Message received.
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    Thank you — we&apos;ll respond within 2–3 business days.
                  </p>
                  <button
                    type="button"
                    onClick={resetAll}
                    className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full border border-hairline bg-white px-6 text-sm font-medium text-graphite transition-colors hover:border-graphite"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  {serverError ? (
                    <div
                      role="alert"
                      className="mb-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                      {serverError}
                    </div>
                  ) : null}

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <FieldLabel htmlFor="contact-name" text="Full Name" required />
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                        aria-invalid={Boolean(errors.name)}
                        className={inputClass(Boolean(errors.name))}
                        placeholder="Your name"
                      />
                      <FieldError message={errors.name} />
                    </div>

                    <div>
                      <FieldLabel htmlFor="contact-email" text="Email" required />
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                        aria-invalid={Boolean(errors.email)}
                        className={inputClass(Boolean(errors.email))}
                        placeholder="you@company.com"
                      />
                      <FieldError message={errors.email} />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-6 sm:grid-cols-2">
                    <div>
                      <FieldLabel htmlFor="contact-organization" text="Organization" />
                      <input
                        id="contact-organization"
                        name="organization"
                        type="text"
                        autoComplete="organization"
                        value={form.organization}
                        onChange={(e) => update("organization", e.target.value)}
                        className={inputClass(false)}
                        placeholder="Optional"
                      />
                    </div>

                    <div>
                      <FieldLabel
                        htmlFor="contact-inquiry-type"
                        text="Inquiry Type"
                        required
                      />
                      <Select
                        value={form.inquiryType}
                        onValueChange={(value) =>
                          update("inquiryType", value as InquiryType)
                        }
                      >
                        <SelectTrigger
                          id="contact-inquiry-type"
                          aria-invalid={Boolean(errors.inquiryType)}
                          className={cn(
                            "h-11 w-full rounded-lg border-hairline bg-warmwhite px-4 font-normal shadow-none data-[size=default]:h-11 sm:text-sm",
                            errors.inquiryType ? "border-red-300" : undefined
                          )}
                        >
                          <SelectValue placeholder="Select an inquiry type" />
                        </SelectTrigger>
                        <SelectContent>
                          {INQUIRY_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {INQUIRY_CATEGORIES.find((c) => c.type === type)
                                ?.label ?? type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError message={errors.inquiryType} />
                    </div>
                  </div>

                  <div className="mt-6">
                    <FieldLabel htmlFor="contact-subject" text="Subject" required />
                    <input
                      id="contact-subject"
                      name="subject"
                      type="text"
                      value={form.subject}
                      onChange={(e) => update("subject", e.target.value)}
                      aria-invalid={Boolean(errors.subject)}
                      className={inputClass(Boolean(errors.subject))}
                      placeholder="What is this about?"
                    />
                    <FieldError message={errors.subject} />
                  </div>

                  <div className="mt-6">
                    <FieldLabel htmlFor="contact-message" text="Message" required />
                    <Textarea
                      id="contact-message"
                      name="message"
                      rows={6}
                      value={form.message}
                      onChange={(e) => update("message", e.target.value)}
                      aria-invalid={Boolean(errors.message)}
                      className={cn(
                        "min-h-[132px] w-full rounded-lg border bg-warmwhite px-4 py-3 text-sm text-graphite transition placeholder:text-ink-soft focus-visible:border-electric focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric",
                        errors.message ? "border-red-300" : "border-hairline"
                      )}
                      placeholder="Tell us a little about your inquiry — context helps us route it to the right person."
                    />
                    <FieldError message={errors.message} />
                  </div>

                  {/* Honeypot — hidden from humans, irresistible to bots */}
                  <div className="absolute -left-[9999px]" aria-hidden="true">
                    <label htmlFor="contact-website">Website</label>
                    <input
                      id="contact-website"
                      name="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={form.website}
                      onChange={(e) => update("website", e.target.value)}
                    />
                  </div>

                  <div className="mt-6">
                    <label
                      htmlFor="contact-consent"
                      className="flex cursor-pointer items-start gap-3"
                    >
                      <input
                        id="contact-consent"
                        name="consent"
                        type="checkbox"
                        checked={form.consent}
                        onChange={(e) => update("consent", e.target.checked)}
                        aria-invalid={Boolean(errors.consent)}
                        className="mt-0.5 size-4 shrink-0 cursor-pointer accent-electric"
                      />
                      <span className="text-sm leading-relaxed text-ink-soft">
                        I agree to the{" "}
                        <Link
                          to="/privacy-policy"
                          onClick={(e) => e.stopPropagation()}
                          className="font-medium text-electric underline-offset-4 hover:underline"
                        >
                          privacy policy
                        </Link>{" "}
                        and consent to ETARNITY storing this information to
                        respond to my inquiry.
                      </span>
                    </label>
                    <FieldError message={errors.consent} />
                  </div>

                  <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">
                      We route inquiries internally — no mailing lists.
                    </p>
                    <button
                      type="submit"
                      disabled={sending}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-graphite px-6 py-3 text-sm font-medium text-warmwhite transition-colors hover:bg-[#23262D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {sending ? (
                        <Loader2
                          className="size-4 animate-spin"
                          aria-hidden="true"
                        />
                      ) : null}
                      {sending ? "Sending…" : "Send Message"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </>
  );
}
