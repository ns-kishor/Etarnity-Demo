"use client";

import * as React from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { contact } from "@/content/site";
import {
  Reveal,
  SectionHeading,
  SectionShell,
} from "@/components/primitives/corporate";

type FormState = "idle" | "submitting" | "success" | "error";

export function Contact() {
  const { toast } = useToast();
  const [state, setState] = React.useState<FormState>("idle");
  const [category, setCategory] = React.useState<string>(contact.categories[0]);
  const formRef = React.useRef<HTMLFormElement>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state === "submitting") return;
    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      organization: String(data.get("organization") || "").trim(),
      category,
      message: String(data.get("message") || "").trim(),
    };

    if (!payload.name || !payload.email || !payload.message) {
      toast({
        title: "A few fields are missing",
        description: "Name, email and message are required.",
      });
      return;
    }

    setState("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      setState("success");
      form.reset();
      setCategory(contact.categories[0]);
      toast({
        title: "Message received",
        description: "Thank you — someone on the leadership team will respond within two business days.",
      });
    } catch {
      setState("error");
      toast({
        title: "Something went wrong",
        description: "Your message wasn't sent. Please try again, or email us directly.",
        variant: "destructive",
      });
    }
  };

  return (
    <SectionShell id="contact" ariaLabel="Contact ETARNITY" className="bg-background">
      <div className="grid gap-14 py-20 md:py-28 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        {/* Positioning */}
        <div>
          <SectionHeading
            index={contact.index}
            kicker={contact.kicker}
            title={contact.title}
            lead={contact.lead}
            serifTitle
          />

          <div className="mt-12 space-y-0">
            {contact.channels.map((ch, i) => (
              <Reveal key={ch.label} delay={0.1 + i * 0.07} distance={14}>
                <div className="flex flex-col gap-1 border-t border-border/60 py-5 sm:flex-row sm:items-baseline sm:justify-between">
                  <span className="label-mono">{ch.label}</span>
                  {ch.href ? (
                    <a
                      href={ch.href}
                      className="text-[15px] font-medium text-ivory transition-colors hover:text-emerald-corp"
                    >
                      {ch.value}
                    </a>
                  ) : (
                    <span className="text-[15px] font-medium text-ivory">{ch.value}</span>
                  )}
                </div>
              </Reveal>
            ))}
            <div className="hairline" aria-hidden="true" />
          </div>
        </div>

        {/* The conversation form */}
        <Reveal direction="left" distance={32} delay={0.1}>
          <div className="relative rounded-md border border-border/70 bg-card/60 p-6 md:p-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-px rounded-md bg-[radial-gradient(ellipse_at_top,var(--glow-faint),transparent_60%)]"
            />

            {state === "success" ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center" role="status">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-corp/40 bg-emerald-corp/10">
                  <Check className="h-5 w-5 text-emerald-corp" aria-hidden="true" />
                </span>
                <h3 className="mt-6 text-xl font-medium tracking-tight text-ivory">
                  Message received.
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  Thank you for reaching out to ETARNITY. A member of the leadership team will
                  respond within two business days.
                </p>
                <Button
                  variant="outline"
                  className="mt-8 border-border hover:border-emerald-corp/50"
                  onClick={() => setState("idle")}
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <form ref={formRef} onSubmit={onSubmit} className="relative space-y-5" noValidate>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="contact-name" className="label-mono block">
                      Name *
                    </label>
                    <Input
                      id="contact-name"
                      name="name"
                      autoComplete="name"
                      required
                      placeholder="Your full name"
                      className="h-11 border-border/70 bg-background/60 placeholder:text-muted-foreground/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="contact-email" className="label-mono block">
                      Email *
                    </label>
                    <Input
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="you@company.com"
                      className="h-11 border-border/70 bg-background/60 placeholder:text-muted-foreground/40"
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="contact-org" className="label-mono block">
                      Organization
                    </label>
                    <Input
                      id="contact-org"
                      name="organization"
                      autoComplete="organization"
                      placeholder="Company or institution"
                      className="h-11 border-border/70 bg-background/60 placeholder:text-muted-foreground/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="contact-category" className="label-mono block">
                      I'm reaching out about
                    </label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger
                        id="contact-category"
                        className="h-11 border-border/70 bg-background/60"
                        aria-label="Contact category"
                      >
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="border-border/70 bg-popover">
                        {contact.categories.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-message" className="label-mono block">
                    Message *
                  </label>
                  <Textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={5}
                    placeholder="Tell us what you're building, or what you'd like to explore with ETARNITY."
                    className="min-h-[132px] resize-y border-border/70 bg-background/60 placeholder:text-muted-foreground/40"
                  />
                </div>

                <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[11.5px] leading-snug text-muted-foreground/70">
                    Every message reaches a real person on the leadership team.
                  </p>
                  <Button
                    type="submit"
                    disabled={state === "submitting"}
                    className="h-11 gap-2.5 rounded-sm bg-ivory px-6 text-[14px] font-semibold text-background hover:bg-emerald-corp/85 hover:text-primary-foreground"
                  >
                    {state === "submitting" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Sending
                      </>
                    ) : (
                      <>
                        Start the conversation
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}
