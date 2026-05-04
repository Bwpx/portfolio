import { siteData } from "@/data/portfolio";

export default function Footer() {
  return (
    <footer className="border-t border-[#27272a]/70 py-8 bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto px-6 text-center text-[#52525b] text-sm">
        {siteData.footer.text}
      </div>
    </footer>
  );
}
