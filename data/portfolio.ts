// ─── Site Content ──────────────────────────────────────────────────────────
// Edit this file to update any content across the portfolio.

export const siteData = {
  name: "Martin Gonzalez",
  navLinks: ["About", "Projects", "Skills", "Contact"] as const,

  hero: {
    greeting: "Hello World! I'm",
    roleLeft: "Computer Science Student",
    roleRight: "Future AI/ML Engineer",
    description:
      "I'm a Computer Science student at The University of Texas at San Antonio pursuing a concentration in Software Engineering. I'm focused on building my software development skills now, with the long-term goal of becoming an AI/ML Engineer.",
    cta: {
      primary: { label: "View Projects", href: "#projects" },
      secondary: { label: "Contact Me", href: "#contact" },
    },
  },

  about: {
    paragraphs: [
      "I am a Computer Science student at UTSA with a concentration in Software Engineering. I enjoy building projects that solve real problems and create better user experiences.",
      "My current focus is strengthening my software engineering fundamentals through coursework and hands-on projects — writing clean, maintainable code and developing a structured approach to problem-solving. Alongside that, I'm steadily building toward the AI/ML space, with the long-term goal of working as an AI/ML Engineer.",
    ],
    info: [
      { label: "Name", value: "Martin Gonzalez" },
      { label: "Location", value: "San Antonio, TX" },
      { label: "Education", value: "UTSA — B.S. Computer Science" },
      { label: "Concentration", value: "Software Engineering" },
      { label: "Focus", value: "Software Development → AI/ML" },
    ],
  },

  // ─── Add new projects here ────────────────────────────────────────────────
  projects: [
    {
      title: "FPSOpti AI",
      description:
        "Windows desktop app that scans your PC's hardware and uses a local LLM (via Ollama) to generate optimized in-game graphics settings for any title. Streams the AI report live, ships with a curated knowledge base of 21 popular games, and runs entirely on-device — your specs never leave your machine.",
      tech: ["Python", "CustomTkinter", "Ollama", "PyInstaller"],
      github: "https://github.com/bwpx/fpsopti-ai",
      download:
        "https://github.com/bwpx/fpsopti-ai/releases/latest/download/FPSOptiAI.exe",
      details: "/fpsopti-ai/",
    },
    {
      title: "Controller Diagnostics Web App",
      description:
        "Built an interactive web application that displays controller input data and helps test controller functionality in real time. The app makes it easier to monitor button presses, stick movement, and overall controller behavior through a simple and accessible interface. Deployed online with Vercel so users can access it without running it locally.",
      tech: ["JavaScript", "React", "Vercel"],
      github: "https://github.com/bwpx",
      live: "https://controller-diagnostics.vercel.app",
    },
    // {
    //   title: "Your Next Project",
    //   description: "Project description goes here.",
    //   tech: ["Next.js", "TypeScript"],
    //   github: "",
    //   live: "",
    // },
  ],

  // ─── Add or remove skills per category ───────────────────────────────────
  skills: {
    Languages: ["Java", "Python", "C", "JavaScript", "SQL"],
    "Frameworks & Libraries": ["React", "Node.js"],
    Tools: ["Git", "GitHub", "VS Code", "Eclipse", "Azure", "Vercel", "MySQL", "Slack"],
  } as Record<string, string[]>,

  contact: {
    intro:
      "I'm always open to new opportunities, internships, and collaborations. Feel free to reach out — I'd love to connect.",
    email: "gonz2004@icloud.com",
    github: {
      url: "https://github.com/bwpx",
      label: "bwpx",
    },
    linkedin: {
      url: "https://linkedin.com/in/martin-gonzalez",
      label: "Martin Gonzalez",
    },
  },

  footer: {
    text: "Martin Gonzalez © 2026. All rights reserved.",
  },
};
