"use client";

/**
 * ETARNITY — Contact.
 * The live conversion surface: a minimal premium form (name / email /
 * company / reason / message) wired end-to-end to POST /api/contact with
 * client validation mirroring the zod schema exactly, alongside the
 * channels ledger and a quiet human-status panel.
 */

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { CheckCircle2, Send } from "lucide-react";
import { contact, site } from "@/content/site";
import {
  Pill,
  Reveal,
  SectionHeading,
  SectionShell,
} from "@/components/etarnity/primitives";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/* ------------------------------ Validation ------------------------------ */

type FieldKey = "name" | "email" | "organization" | "category" | "message";

type FormValues = {
  name: string;
  email: string;
  organization: string;
  message: string;
};

const EMPTY_VALUES: FormValues = {
  name: "",
  email: "",
  organization: "",
  message: "",
};

const FIELD_ORDER: FieldKey[] = [
  "name",
  "email",
  "organization",
  "category",
  "message",
];

/* Mirrors the zod schema in src/app/api/contact/route.ts exactly */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(
  values: FormValues,
  category: string | null
): Partial<Record<FieldKey, string>> {
  const errs: Partial<Record<FieldKey, string>> = {};
  if (values.name.trim().length < 2) {
    errs.name = "Name must be at least 2 characters";
  } else if (values.name.trim().length > 120) {
    errs.name = "Name must be 120 characters or fewer";
  }
  if (!EMAIL_RE.test(values.email.trim())) {
    errs.email = "A valid email address is required";
  } else if (values.email.trim().length > 200) {
    errs.email = "Email must be 200 characters or fewer";
  }
  if (values.organization.trim().length > 160) {
    errs.organization = "Company must be 160 characters or fewer";
  }
  if (!category) {
    errs.category = "Choose a reason for contact";
  }
  if (values.message.trim().length < 10) {
    errs.message = "Message must be at least 10 characters";
  } else if (values.message.trim().length > 5000) {
    errs.message = "Message must be 5000 characters or fewer";
  }
  return errs;
}

/* -------------------------------- Section -------------------------------- */

export function Contact() {
  const { toast } = useToast();

  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [category, setCategory] = useState<string | null>(null);
  const [errors, setErrors] = useState<
    Partial<Record<FieldKey | "form", string>>
  >({});
  const [pending, setPending] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const organizationRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const radioRefs = useRef<Array<HTMLButtonElement | null>>([]);

  /* Move focus into the success panel once it mounts (no setState here). */
  useEffect(() => {
    if (succeeded) {
      successRef.current?.focus();
    }
  }, [succeeded]);

  /* ------------------------------- Handlers ------------------------------- */

  const handleField =
    (field: keyof FormValues) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((v) => ({ ...v, [field]: e.target.value }));
      setErrors((err) => ({ ...err, [field]: undefined }));
    };

  const selectCategory = (c: string) => {
    setCategory(c);
    setErrors((err) => ({ ...err, category: undefined }));
  };

  /* Roving radiogroup: arrow keys move focus and select (wrapping);
     Enter/Space select via the native button click. Home/End jump. */
  const handleCategoryKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const count = contact.categories.length;
    const current = category ? contact.categories.indexOf(category) : 0;
    let next: number;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      next = (current + 1) % count;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      next = (current - 1 + count) % count;
    } else if (e.key === "Home") {
      next = 0;
    } else if (e.key === "End") {
      next = count - 1;
    } else {
      return;
    }
    e.preventDefault();
    selectCategory(contact.categories[next]);
    radioRefs.current[next]?.focus();
  };

  const focusField = (field: FieldKey) => {
    if (field === "category") {
      const idx = category ? contact.categories.indexOf(category) : 0;
      radioRefs.current[idx]?.focus();
      return;
    }
    if (field === "name") {
      nameRef.current?.focus();
    } else if (field === "email") {
      emailRef.current?.focus();
    } else if (field === "organization") {
      organizationRef.current?.focus();
    } else if (field === "message") {
      messageRef.current?.focus();
    }
  };

  const failRemote = () => {
    setErrors({ form: contact.form.error });
    toast({
      variant: "destructive",
      title: contact.form.error,
      description: `Or email us directly at ${site.email}.`,
    });
    setPending(false);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending || succeeded) return;

    const errs = validate(values, category);
    setErrors(errs);
    const firstInvalid = FIELD_ORDER.find((field) => errs[field]);
    if (firstInvalid) {
      focusField(firstInvalid);
      return;
    }
    if (!category) return;

    setPending(true);
    fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.name.trim(),
        email: values.email.trim(),
        organization: values.organization.trim(),
        category,
        message: values.message.trim(),
      }),
    })
      .then((res) => {
        if (res.status === 201) {
          setSucceeded(true);
          setPending(false);
          toast({
            title: contact.form.successTitle,
            description: contact.form.successBody,
          });
          return;
        }
        failRemote();
      })
      .catch(() => failRemote());
  };

  const handleReset = () => {
    setValues(EMPTY_VALUES);
    setCategory(null);
    setErrors({});
    setPending(false);
    setSucceeded(false);
    requestAnimationFrame(() => nameRef.current?.focus());
  };

  /* -------------------------------- Render -------------------------------- */

  const fieldLabel = (htmlFor: string, text: string) => (
    <Label
      htmlFor={htmlFor}
      className="text-[13px] tracking-tight text-foreground/80"
    >
      {text}
      <span className="text-accent-deep" aria-hidden="true">
        *
      </span>
    </Label>
  );

  const fieldError = (field: FieldKey) =>
    errors[field] ? (
      <p
        id={`contact-${field}-error`}
        role="alert"
        className="mt-2 text-[12.5px] leading-snug text-destructive"
      >
        {errors[field]}
      </p>
    ) : null;

  return (
    <SectionShell id="contact" ariaLabel="Contact ETARNITY" alt>
      <SectionHeading
        index={contact.index}
        kicker={contact.kicker}
        title={contact.title}
        lead={contact.lead}
      />

      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        {/* Form / success panel */}
        {succeeded ? (
          <Reveal className="lg:col-span-7" duration={0.7} distance={16}>
            <div
              ref={successRef}
              role="status"
              tabIndex={-1}
              className="card-quiet flex min-h-[420px] flex-col items-start justify-center rounded-[28px] p-6 shadow-ambient outline-none md:p-8"
            >
              <span
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft"
              >
                <CheckCircle2
                  className="h-4 w-4 text-accent-deep"
                  strokeWidth={1.5}
                />
              </span>
              <p className="label-mono mt-6 text-accent-deep">Received</p>
              <h3 className="mt-3 font-display text-2xl font-light tracking-tight text-foreground md:text-3xl">
                {contact.form.successTitle}
              </h3>
              <p className="mt-3 max-w-md text-[14.5px] leading-relaxed text-muted-foreground">
                {contact.form.successBody}
              </p>
              <Pill variant="ghost" onClick={handleReset} className="mt-8">
                Send another message
              </Pill>
            </div>
          </Reveal>
        ) : (
          <Reveal className="lg:col-span-7" delay={0.08}>
            <form
              onSubmit={handleSubmit}
              noValidate
              className="card-quiet rounded-[28px] p-6 shadow-ambient md:p-8"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  {fieldLabel("contact-name", contact.form.nameLabel)}
                  <Input
                    id="contact-name"
                    ref={nameRef}
                    value={values.name}
                    onChange={handleField("name")}
                    maxLength={120}
                    autoComplete="name"
                    required
                    aria-invalid={errors.name ? true : undefined}
                    aria-describedby={
                      errors.name ? "contact-name-error" : undefined
                    }
                    className="mt-2 h-11 rounded-xl border-border px-4"
                  />
                  {fieldError("name")}
                </div>
                <div>
                  {fieldLabel("contact-email", contact.form.emailLabel)}
                  <Input
                    id="contact-email"
                    ref={emailRef}
                    type="email"
                    value={values.email}
                    onChange={handleField("email")}
                    maxLength={200}
                    autoComplete="email"
                    required
                    aria-invalid={errors.email ? true : undefined}
                    aria-describedby={
                      errors.email ? "contact-email-error" : undefined
                    }
                    className="mt-2 h-11 rounded-xl border-border px-4"
                  />
                  {fieldError("email")}
                </div>
              </div>

              <div className="mt-5">
                <Label
                  htmlFor="contact-company"
                  className="text-[13px] tracking-tight text-foreground/80"
                >
                  {contact.form.orgLabel}
                </Label>
                <Input
                  id="contact-company"
                  ref={organizationRef}
                  value={values.organization}
                  onChange={handleField("organization")}
                  maxLength={160}
                  autoComplete="organization"
                  aria-invalid={errors.organization ? true : undefined}
                  aria-describedby={
                    errors.organization
                      ? "contact-organization-error"
                      : undefined
                  }
                  className="mt-2 h-11 rounded-xl border-border px-4"
                />
                {fieldError("organization")}
              </div>

              {/* Reason for contact — roving-tabindex radiogroup of chips */}
              <div className="mt-5">
                <p
                  id="contact-category-label"
                  className="flex items-center gap-2 text-[13px] font-medium tracking-tight text-foreground/80"
                >
                  {contact.form.categoryLabel}
                  <span className="text-accent-deep" aria-hidden="true">
                    *
                  </span>
                </p>
                <div
                  role="radiogroup"
                  aria-labelledby="contact-category-label"
                  aria-required="true"
                  aria-describedby={
                    errors.category ? "contact-category-error" : undefined
                  }
                  onKeyDown={handleCategoryKeyDown}
                  className="mt-3 flex flex-wrap gap-2"
                >
                  {contact.categories.map((c, i) => (
                    <button
                      key={c}
                      type="button"
                      role="radio"
                      aria-checked={category === c}
                      tabIndex={category === c || (!category && i === 0) ? 0 : -1}
                      ref={(el) => {
                        radioRefs.current[i] = el;
                      }}
                      onClick={() => selectCategory(c)}
                      className={cn(
                        "label-mono rounded-full border px-4 py-2.5 transition-colors duration-300",
                        category === c
                          ? "border-transparent bg-accent text-accent-foreground shadow-panel"
                          : "border-border bg-card text-muted-foreground hover:border-accent/40 hover:text-foreground"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                {fieldError("category")}
              </div>

              <div className="mt-5">
                {fieldLabel("contact-message", contact.form.messageLabel)}
                <Textarea
                  id="contact-message"
                  ref={messageRef}
                  value={values.message}
                  onChange={handleField("message")}
                  minLength={10}
                  maxLength={5000}
                  rows={6}
                  required
                  aria-invalid={errors.message ? true : undefined}
                  aria-describedby={
                    errors.message ? "contact-message-error" : undefined
                  }
                  className="mt-2 min-h-36 rounded-xl border-border px-4 py-3"
                />
                {fieldError("message")}
              </div>

              <div className="mt-7 flex flex-col gap-4">
                {errors.form && (
                  <p
                    role="alert"
                    className="text-[12.5px] leading-snug text-destructive"
                  >
                    {contact.form.error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium tracking-tight text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-panel disabled:pointer-events-none disabled:opacity-60 sm:w-auto"
                >
                  {pending ? contact.form.pending : contact.form.submit}
                  <Send
                    className="h-4 w-4"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </button>
              </div>
            </form>
          </Reveal>
        )}

        {/* Channels + status panel */}
        <Reveal className="lg:col-span-5" delay={0.16}>
          <dl>
            {contact.channels.map((channel) => (
              <div
                key={channel.label}
                className="grid grid-cols-[104px_1fr] gap-4 border-t border-border py-5 sm:grid-cols-[128px_1fr]"
              >
                <dt className="label-mono pt-0.5 text-muted-foreground">
                  {channel.label}
                </dt>
                <dd className="text-[15px] font-medium tracking-tight text-foreground">
                  {"href" in channel ? (
                    <a
                      href={channel.href}
                      className="underline decoration-border underline-offset-4 transition-colors hover:text-accent-deep hover:decoration-accent"
                    >
                      {channel.value}
                    </a>
                  ) : (
                    channel.value
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 rounded-[20px] bg-accent-soft/40 p-5">
            <div className="flex items-center gap-3">
              <span
                className="relative flex h-2 w-2 shrink-0"
                aria-hidden="true"
              >
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              <p className="label-mono text-accent-deep">
                Every message reaches a real person
              </p>
            </div>
            <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">
              The leadership team reads every introduction — tell us what you
              want to build.
            </p>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}
