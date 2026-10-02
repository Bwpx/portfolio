"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { siteData } from "@/data/portfolio";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0a0a]/85 backdrop-blur-md border-b border-[#27272a]/70"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo — code-bracket monogram */}
        <a
          href="#"
          className="font-mono text-base font-semibold text-[#e4e4e7] hover:text-amber-400 transition-colors duration-200"
          aria-label="Home"
        >
          <span className="text-amber-500">{"<"}</span>
          mg
          <span className="text-amber-500">{" />"}</span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {siteData.navLinks.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-sm text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors duration-200"
            >
              {link}
            </a>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          aria-label="Toggle menu"
          className="md:hidden text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-[#111113] border-t border-[#27272a]/70 px-6 py-5 flex flex-col gap-5">
          {siteData.navLinks.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-sm text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors"
              onClick={closeMenu}
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
