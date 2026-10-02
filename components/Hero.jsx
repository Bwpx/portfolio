import { Mail } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "./Icons";
import { siteData } from "@/data/portfolio";

export default function Hero() {
  const { hero, contact } = siteData;

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center hero-grid overflow-hidden"
    >
      {/* Radial fade over the dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 50%, transparent 20%, #0a0a0a 85%)",
        }}
      />

      {/* Subtle emerald glow — top right accent */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-amber-500 opacity-[0.06] blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-6 pt-28 pb-20 w-full anim-fade-up">
        <p className="text-sm text-amber-400 font-medium mb-5 tracking-wide font-mono">
          {hero.greeting}
        </p>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-[#e4e4e7] leading-[1.05] tracking-tight mb-5">
          {siteData.name}
        </h1>

        <p className="text-lg md:text-2xl font-medium mb-7 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-[#a1a1aa]">{hero.roleLeft}</span>
          <span className="text-[#3f3f46]">|</span>
          <span className="text-amber-400">{hero.roleRight}</span>
        </p>

        <p className="text-[#71717a] text-base md:text-[17px] max-w-[560px] leading-relaxed mb-10">
          {hero.description}
        </p>

        <div className="flex flex-wrap gap-4 mb-12">
          <a
            href={hero.cta.primary.href}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/20"
          >
            {hero.cta.primary.label}
          </a>
          <a
            href={hero.cta.secondary.href}
            className="px-6 py-3 border border-[#27272a] hover:border-amber-500/50 text-[#a1a1aa] hover:text-[#e4e4e7] text-sm font-medium rounded-lg transition-all duration-200"
          >
            {hero.cta.secondary.label}
          </a>
        </div>

        <div className="flex items-center gap-5">
          <a
            href={contact.github.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-[#71717a] hover:text-amber-400 transition-colors duration-200"
          >
            <GitHubIcon size={20} />
          </a>
          <a
            href={contact.linkedin.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="text-[#71717a] hover:text-amber-400 transition-colors duration-200"
          >
            <LinkedInIcon size={20} />
          </a>
          <a
            href={`mailto:${contact.email}`}
            aria-label="Email"
            className="text-[#71717a] hover:text-amber-400 transition-colors duration-200"
          >
            <Mail size={20} />
          </a>
        </div>
      </div>
    </section>
  );
}
