"use client";

import * as React from "react";
import { Check, Loader2, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { contact, site } from "@/content/machina";
import {
  FloatCard,
  Kicker,
  MonoLabel,
  MfSection,
  Reveal,
  SectionTitle,
} from "@/components/machina/mf-primitives";
import { cn } from "@/lib/utils";

/**
 * Contact — the "Introduce yourself." section.
 *
 * Left: a pill-styled form wired to POST /api/contact (field rules mirror
 * the API's zod schema exactly). Right: direct channels + a hiring status
 * panel. The form is replaced by a success panel on 201 and can be reset
 * with "Send another". Fully keyboard accessible, including a roving
 * radiogroup for the category chips.
 */

type FormValues = {
  name: string;
  email: string;
  organization: string;
  message: string;
};

type FieldKey = "name" | "email" | "message";

type FieldErrors = Partial<Record<FieldKey, string>>;

type Status = "idle" | "submitting" | "success";

/* Mirrors the zod schema in src/app/api/contact/route.ts. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FIELD_ORDER: FieldKey[] = ["name", "email", "message"];

function validate(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};
  if (values.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }
  if (!EMAIL_RE.test(values.email.trim())) {
    errors.email = "A valid email address is required";
  }
  if (values.message.trim().length < 10) {
    errors.message = "Message must be at least 10 characters";
  }
  return errors;
}

/* Shared pill-input styling (rounded-2xl, card surface, hairline border). */
const INPUT_CLASS =
  "h-12 rounded-2xl border-border bg-card px-4 shadow-none dark:bg-card";
const TEXTAREA_CLASS =
  "min-h-[140px] rounded-2xl border-border bg-card px-4 py-3 shadow-none dark:bg-card";

export function ContactMachina() {
  const { toast } = useToast();
  const [values, setValues] = React.useState<FormValues>({
    name: "",
    email: "",
    organization: "",
    message: "",
  });
  const [category, setCategory] = React.useState<string>(
    contact.categories[0]
  );
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<Status>("idle");

  const successRef = React.useRef<HTMLDivElement>(null);
  const nameInputRef = React.useRef<HTMLInputElement>(null);
  const radioRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  /* Move focus to the success panel when the form is replaced. */
  React.useEffect(() => {
    if (status === "success") {
      successRef.current?.focus();
    }
  }, [status]);

  function updateField(field: keyof FormValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (field !== "organization") {
      setFieldErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  /* Radiogroup arrow-key navigation (roving tabindex). */
  function handleRadioKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) {
    const { key } = event;
    let delta = 0;
    if (key === "ArrowRight" || key === "ArrowDown") delta = 1;
    else if (key === "ArrowLeft" || key === "ArrowUp") delta = -1;
    if (delta === 0) return;
    event.preventDefault();
    const count = contact.categories.length;
    const next = (index + delta + count) % count;
    setCategory(contact.categories[next]);
    radioRefs.current[next]?.focus();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    setFormError(null);
    const errors = validate(values);
    setFieldErrors(errors);

    if (errors.name || errors.email || errors.message) {
      const first = FIELD_ORDER.find((key) => errors[key]);
      if (first) {
        document.getElementById(`mf-contact-${first}`)?.focus();
      }
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          organization: values.organization.trim(),
          category,
          message: values.message.trim(),
        }),
      });

      if (res.status === 201) {
        setStatus("success");
        toast({
          title: contact.form.successTitle,
          description: contact.form.successBody,
        });
        return;
      }

      setStatus("idle");
      setFormError(contact.form.error);
      toast({
        title: contact.form.error,
        description: `You can also email ${site.email} directly.`,
        variant: "destructive",
      });
    } catch {
      setStatus("idle");
      setFormError(contact.form.error);
      toast({
        title: contact.form.error,
        description: `You can also email ${site.email} directly.`,
        variant: "destructive",
      });
    }
  }

  function resetForm() {
    setValues({ name: "", email: "", organization: "", message: "" });
    setCategory(contact.categories[0]);
    setFieldErrors({});
    setFormError(null);
    setStatus("idle");
    requestAnimationFrame(() => nameInputRef.current?.focus());
  }

  return (
    <MfSection id="contact" ariaLabel="MachinaFusion — contact">
      {/* Soft neon atmosphere behind the section */}
      <div
        className="orb orb-neon -z-10 -top-24 -right-24 h-[34rem] w-[34rem]"
        aria-hidden="true"
      />

      <Reveal y={18}>
        <Kicker index="05" label={contact.kicker} />
      </Reveal>

      <Reveal y={24} delay={0.08} className="mt-6">
        <div className="max-w-2xl">
          <SectionTitle>
            Introduce <span className="editorial-accent">yourself</span>.
          </SectionTitle>
          <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            {contact.lead}
          </p>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-12 lg:gap-10">
        {/* LEFT — the transmission form */}
        <Reveal y={28} delay={0.12} className="lg:col-span-7">
          <FloatCard className="p-6 md:p-8">
            {status === "success" ? (
              <SuccessPanel ref={successRef} onReset={resetForm} />
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                aria-label="Contact form"
                className="space-y-6"
              >
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="mf-contact-name">
                      {contact.form.nameLabel}
                    </Label>
                    <Input
                      ref={nameInputRef}
                      id="mf-contact-name"
                      name="name"
                      value={values.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      autoComplete="name"
                      maxLength={120}
                      required
                      aria-invalid={fieldErrors.name ? true : undefined}
                      aria-describedby={
                        fieldErrors.name ? "mf-contact-name-error" : undefined
                      }
                      className={INPUT_CLASS}
                    />
                    {fieldErrors.name && (
                      <p
                        id="mf-contact-name-error"
                        className="text-xs leading-snug text-destructive"
                      >
                        {fieldErrors.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mf-contact-email">
                      {contact.form.emailLabel}
                    </Label>
                    <Input
                      id="mf-contact-email"
                      name="email"
                      type="email"
                      value={values.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      autoComplete="email"
                      maxLength={200}
                      required
                      placeholder="you@company.com"
                      aria-invalid={fieldErrors.email ? true : undefined}
                      aria-describedby={
                        fieldErrors.email ? "mf-contact-email-error" : undefined
                      }
                      className={INPUT_CLASS}
                    />
                    {fieldErrors.email && (
                      <p
                        id="mf-contact-email-error"
                        className="text-xs leading-snug text-destructive"
                      >
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mf-contact-org">
                    {contact.form.orgLabel}
                  </Label>
                  <Input
                    id="mf-contact-org"
                    name="organization"
                    value={values.organization}
                    onChange={(e) =>
                      updateField("organization", e.target.value)
                    }
                    autoComplete="organization"
                    maxLength={160}
                    placeholder="Company, lab or studio"
                    className={INPUT_CLASS}
                  />
                </div>

                {/* Category — pill radio chips (radiogroup semantics) */}
                <div className="space-y-2.5">
                  <p
                    id="mf-contact-category-label"
                    className="select-none text-sm font-medium leading-none"
                  >
                    {contact.form.categoryLabel}
                  </p>
                  <div
                    role="radiogroup"
                    aria-labelledby="mf-contact-category-label"
                    className="flex flex-wrap gap-2"
                  >
                    {contact.categories.map((cat, i) => {
                      const isChecked = cat === category;
                      return (
                        <button
                          key={cat}
                          ref={(el) => {
                            radioRefs.current[i] = el;
                          }}
                          type="button"
                          role="radio"
                          aria-checked={isChecked}
                          tabIndex={isChecked ? 0 : -1}
                          onClick={() => setCategory(cat)}
                          onKeyDown={(e) => handleRadioKeyDown(e, i)}
                          className={cn(
                            "inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-300",
                            isChecked
                              ? "border-transparent bg-primary text-primary-foreground"
                              : "border-border bg-card text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mf-contact-message">
                    {contact.form.messageLabel}
                  </Label>
                  <Textarea
                    id="mf-contact-message"
                    name="message"
                    value={values.message}
                    onChange={(e) => updateField("message", e.target.value)}
                    maxLength={5000}
                    required
                    placeholder="Tell us what you want to build, explore or ask."
                    aria-invalid={fieldErrors.message ? true : undefined}
                    aria-describedby={
                      fieldErrors.message
                        ? "mf-contact-message-error"
                        : undefined
                    }
                    className={TEXTAREA_CLASS}
                  />
                  {fieldErrors.message && (
                    <p
                      id="mf-contact-message-error"
                      className="text-xs leading-snug text-destructive"
                    >
                      {fieldErrors.message}
                    </p>
                  )}
                </div>

                {formError && (
                  <p
                    role="alert"
                    className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                  >
                    {formError}
                  </p>
                )}

                <div className="flex flex-col-reverse items-start gap-5 pt-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs leading-snug text-muted-foreground">
                    Replies within two business days.
                  </p>
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="group inline-flex items-center gap-2.5 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg disabled:pointer-events-none disabled:opacity-60"
                  >
                    {status === "submitting" ? (
                      <>
                        <Loader2
                          className="h-4 w-4 animate-spin"
                          aria-hidden="true"
                        />
                        {contact.form.pending}
                      </>
                    ) : (
                      <>
                        {contact.form.submit}
                        <Send
                          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </FloatCard>
        </Reveal>

        {/* RIGHT — direct channels + hiring status */}
        <div className="lg:col-span-5">
          <Reveal y={28} delay={0.2}>
            <dl className="divide-y divide-border">
              {contact.channels.map((channel) => (
                <div
                  key={channel.label}
                  className="flex flex-col gap-1.5 py-5 first:pt-0 sm:flex-row sm:items-baseline sm:justify-between"
                >
                  <dt className="label-tag shrink-0 text-muted-foreground">
                    {channel.label}
                  </dt>
                  <dd className="text-[15px] font-medium text-foreground sm:text-right">
                    {channel.href ? (
                      <a
                        href={channel.href}
                        className="transition-colors hover:text-[var(--accent)]"
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
          </Reveal>

          <Reveal y={28} delay={0.28}>
            <div className="panel-dark shadow-panel mt-6 rounded-[22px] p-5">
              <div className="flex items-center gap-3">
                <span className="status-dot" aria-hidden="true" />
                <p className="label-tag text-panel-foreground">
                  Available positions
                </p>
              </div>
              <p className="mt-3.5 text-sm leading-relaxed text-panel-muted">
                We read every introduction — tell us what you want to build.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </MfSection>
  );
}

/** Success state — replaces the form after a 201 from the API. */
function SuccessPanel({
  ref,
  onReset,
}: {
  ref?: React.Ref<HTMLDivElement>;
  onReset: () => void;
}) {
  return (
    <div
      ref={ref}
      role="status"
      tabIndex={-1}
      className="flex min-h-[26rem] flex-col items-center justify-center px-6 py-10 text-center outline-none"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-accent/40 bg-accent/10">
        <Check className="h-6 w-6 text-[var(--accent)]" aria-hidden="true" />
      </span>
      <h3 className="mt-6 font-display text-2xl font-medium tracking-tight text-foreground">
        {contact.form.successTitle}
      </h3>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {contact.form.successBody}
      </p>
      <MonoLabel className="mt-6 text-[var(--accent)]">Received</MonoLabel>
      <button
        type="button"
        onClick={onReset}
        className="mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md"
      >
        Send another
      </button>
    </div>
  );
}
