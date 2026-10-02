import { siteData } from "@/data/portfolio";
import SectionHeading from "./SectionHeading";

export default function About() {
  const { about } = siteData;

  return (
    <section id="about" className="py-24 sm:py-28 bg-[#111113]">
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeading eyebrow="Introduction" title="About Me" />

        <div className="grid md:grid-cols-5 gap-10 md:gap-12 items-start">
          <div className="md:col-span-3 space-y-4">
            {about.paragraphs.map((para, i) => (
              <p key={i} className="text-[#a1a1aa] leading-relaxed text-[15px]">
                {para}
              </p>
            ))}
          </div>

          <div className="md:col-span-2">
            <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-6">
              <h3 className="text-[11px] font-semibold text-amber-400 uppercase tracking-[0.2em] mb-5 font-mono">
                Quick Facts
              </h3>
              <dl className="space-y-4">
                {about.info.map((item) => (
                  <div key={item.label}>
                    <dt className="text-[10px] text-[#52525b] uppercase tracking-widest mb-1">
                      {item.label}
                    </dt>
                    <dd className="text-sm text-[#e4e4e7]">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
