"use client";

import { Link } from "@/lib/router";
import { PageHeader } from "../page-header";
import { Reveal } from "../reveal";

interface LegalSection {
  heading: string;
  paragraphs: string[];
}

const SECTIONS: LegalSection[] = [
  {
    heading: "1. Overview",
    paragraphs: [
      "This policy explains what information ETARNITY collects through etarnity.com and how it is used. The short version: we collect the information you voluntarily submit through our contact form — your name, email address, organization, and the content of your message — and nothing else.",
      "We do not run hidden trackers, fingerprinting, or background profiling. If you never fill in the contact form, we receive no personal information from your visit.",
    ],
  },
  {
    heading: "2. How We Use Information",
    paragraphs: [
      "Contact form submissions are used for one purpose: responding to your inquiry. Your message is routed to the relevant person inside ETARNITY so they can reply.",
      "We do not add contacts to marketing lists, and we do not send unsolicited email. If you ask about a project, you will hear back about that project — nothing more.",
    ],
  },
  {
    heading: "3. Cookies",
    paragraphs: [
      "etarnity.com sets a single session cookie for administrators who sign in to manage site content. It exists only to keep that administrative session alive.",
      "We use no tracking cookies, no advertising cookies, and no third-party analytics scripts. A regular visit to this website stores nothing in your browser.",
    ],
  },
  {
    heading: "4. Data Storage",
    paragraphs: [
      "Contact inquiries are stored in our own infrastructure, under our direct control. Data is retained only as long as needed to handle your inquiry, after which it is deleted.",
      "We do not export or mirror your information to third-party marketing or CRM platforms.",
    ],
  },
  {
    heading: "5. Your Rights",
    paragraphs: [
      "You may request access to the information we hold about you, ask for corrections, or ask for deletion at any time.",
      "To exercise any of these rights, email hello@etarnity.com and we will respond within a reasonable timeframe.",
    ],
  },
  {
    heading: "6. Third Parties",
    paragraphs: [
      "We do not sell, rent, or share personal data with third parties. There are no data brokers, advertising networks, or analytics vendors in the loop.",
      "The only people who see your inquiry are the ETARNITY team members handling it.",
    ],
  },
  {
    heading: "7. Security",
    paragraphs: [
      "We apply reasonable technical and organizational measures to protect the information we hold, including access limited to team members who need it.",
      "That said, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.",
    ],
  },
  {
    heading: "8. Changes",
    paragraphs: [
      "If this policy changes, we will update this page and revise the date shown above. The current version is always the one published here.",
      "We recommend checking back occasionally if this matters to you.",
    ],
  },
  {
    heading: "9. Contact",
    paragraphs: [
      "Questions about this policy can be sent to hello@etarnity.com. We read everything and respond to legitimate inquiries.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="07 / LEGAL"
        title="Privacy Policy."
        backTo={{ to: "/", label: "Home" }}
      />

      <div className="container-site py-16 md:py-20">
        <div className="mx-auto max-w-[760px]">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-soft">
              Last updated — 2025 · Applies to etarnity.com
            </p>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="mt-10 space-y-10">
              {SECTIONS.map((section) => (
                <section key={section.heading}>
                  <h2 className="mb-3 text-xl font-semibold tracking-tight text-graphite">
                    {section.heading}
                  </h2>
                  <div className="space-y-4">
                    {section.paragraphs.map((paragraph, index) => (
                      <p
                        key={index}
                        className="text-[15px] leading-[1.8] text-ink-soft"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <p className="mt-14 border-t border-hairline pt-8 text-sm text-ink-soft">
              See also our{" "}
              <Link
                to="/terms"
                className="font-medium text-electric underline-offset-4 hover:underline"
              >
                Terms of Use
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </div>
    </>
  );
}
