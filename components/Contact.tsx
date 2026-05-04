import { Mail } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "./Icons";
import { siteData } from "@/data/portfolio";
import SectionHeading from "./SectionHeading";

export default function Contact() {
  const { contact } = siteData;

  return (
    <section id="contact" className="py-24 sm:py-28 bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeading eyebrow="Get In Touch" title="Contact" />

        <div className="max-w-lg">
          <p className="text-[#a1a1aa] text-[15px] leading-relaxed mb-10">
            {contact.intro}
          </p>

          <div className="space-y-4">
            <ContactRow
              href={`mailto:${contact.email}`}
              icon={<Mail size={17} />}
              label="Email"
              value={contact.email}
            />
            <ContactRow
              href={contact.github.url}
              icon={<GitHubIcon size={17} />}
              label="GitHub"
              value={contact.github.label}
              external
            />
            <ContactRow
              href={contact.linkedin.url}
              icon={<LinkedInIcon size={17} />}
              label="LinkedIn"
              value={contact.linkedin.label}
              external
            />
          </div>
        </div>
      </div>
    </section>
  );
}

interface ContactRowProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  external?: boolean;
}

function ContactRow({ href, icon, label, value, external = false }: ContactRowProps) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="flex items-center gap-4 group w-fit"
    >
      <div className="w-11 h-11 flex items-center justify-center rounded-lg bg-[#18181b] border border-[#27272a] text-[#52525b] group-hover:text-amber-400 group-hover:border-amber-500/40 transition-all duration-200 shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-[10px] text-[#52525b] uppercase tracking-widest mb-0.5">
          {label}
        </div>
        <div className="text-sm text-[#a1a1aa] group-hover:text-[#e4e4e7] transition-colors duration-200">
          {value}
        </div>
      </div>
    </a>
  );
}
