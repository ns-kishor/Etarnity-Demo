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
    heading: "1. Acceptance",
    paragraphs: [
      "By accessing etarnity.com you agree to these Terms of Use. If you do not agree with them, please do not use the website.",
      "These terms apply to the website itself. Engagements, projects, and partnerships are governed by their own written agreements.",
    ],
  },
  {
    heading: "2. Nature of Content",
    paragraphs: [
      "This is an informational corporate website. It describes ETARNITY, the ecosystem we are building, and the work we do.",
      "Content is provided “as is”, for general information — not as professional, legal, or financial advice.",
    ],
  },
  {
    heading: "3. Intellectual Property",
    paragraphs: [
      "The design, text, and content of this website are owned by ETARNITY unless stated otherwise.",
      "Product and business names referenced here belong to their respective owners. We label relationships and ownership honestly, and we expect the same courtesy toward ours.",
    ],
  },
  {
    heading: "4. Accuracy",
    paragraphs: [
      "We present only verifiable information about our businesses, projects, and team. Even so, content may change as the company evolves.",
      "Nothing on this website constitutes a warranty of completeness, and we make no claim beyond what is written.",
    ],
  },
  {
    heading: "5. External Links",
    paragraphs: [
      "Some pages link to third-party websites. We do not control those sites and are not responsible for their content, policies, or availability.",
      "Following an external link means leaving etarnity.com — the destination's terms apply there.",
    ],
  },
  {
    heading: "6. Limitation of Liability",
    paragraphs: [
      "To the fullest extent permitted by applicable law, ETARNITY shall not be liable for any indirect, incidental, or consequential damages arising from the use of this website.",
      "This website is provided without warranties of any kind regarding availability or fitness for a particular purpose.",
    ],
  },
  {
    heading: "7. Governing Law",
    paragraphs: [
      "These terms are governed by the laws of Bangladesh, without regard to conflict-of-law principles, and any disputes are subject to the courts of that jurisdiction.",
    ],
  },
  {
    heading: "8. Changes to Terms",
    paragraphs: [
      "We may update these terms as the company grows. The current version is always the one published on this page, along with its revision date.",
      "Continuing to use the website after a change means you accept the updated terms.",
    ],
  },
  {
    heading: "9. Contact",
    paragraphs: [
      "Questions about these terms can be sent to hello@etarnity.com.",
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="07 / LEGAL"
        title="Terms of Use."
        backTo={{ to: "/", label: "Home" }}
      />

      <div className="container-site py-16 md:py-20">
        <div className="mx-auto max-w-[760px]">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-soft">
              Last updated — 2025
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
                to="/privacy-policy"
                className="font-medium text-electric underline-offset-4 hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </div>
    </>
  );
}
