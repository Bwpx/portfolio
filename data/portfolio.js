// ─── Site Content ──────────────────────────────────────────────────────────
// Edit this file to update any content across the portfolio.

export const siteData = {
  name: "Martin Gonzalez",
  navLinks: ["About", "Projects", "Skills", "Contact"],

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
      image: "/projects/fpsopti-ai.jpg",
      kind: "Windows app",
    },
    {
      title: "Controller Diagnostics Web App",
      description:
        "Built an interactive web application that displays controller input data and helps test controller functionality in real time. The app makes it easier to monitor button presses, stick movement, and overall controller behavior through a simple and accessible interface. Deployed online with Vercel so users can access it without running it locally.",
      tech: ["JavaScript", "React", "Vercel"],
      github: "https://github.com/bwpx",
      live: "https://controller-diagnostics.vercel.app",
      image: "/projects/controller-diagnostics.jpg",
      kind: "Web app",
    },
    // {
    //   title: "Your Next Project",
    //   description: "Project description goes here.",
    //   tech: ["Next.js", "TypeScript"],
    //   github: "",
    //   live: "",
    //   image: "/projects/your-project.jpg", // 16:9 screenshot for the slider
    //   kind: "Web app",
    // },
  ],

  // ─── Skills ──────────────────────────────────────────────────────────────
  // `level` picks the group on the main page (named in skillLevels below);
  // `category` groups them on the resume and the desktop. A skill whose name
  // matches a project's `tech` entry links to that project automatically.
  skillLevels: {
    daily: "Use all the time",
    comfortable: "Comfortable with",
    learning: "Learning now",
  },
  skills: [
    { name: "Java", category: "Languages", level: "daily" },
    { name: "Python", category: "Languages", level: "daily" },
    { name: "C", category: "Languages", level: "comfortable" },
    { name: "JavaScript", category: "Languages", level: "daily" },
    { name: "SQL", category: "Languages", level: "comfortable" },
    { name: "React", category: "Frameworks & Libraries", level: "comfortable" },
    { name: "Node.js", category: "Frameworks & Libraries", level: "comfortable" },
    { name: "CustomTkinter", category: "Frameworks & Libraries", level: "comfortable" },
    { name: "Next.js", category: "Frameworks & Libraries", level: "learning" },
    { name: "Tailwind CSS", category: "Frameworks & Libraries", level: "learning" },
    { name: "Git", category: "Tools", level: "daily" },
    { name: "GitHub", category: "Tools", level: "daily" },
    { name: "VS Code", category: "Tools", level: "daily" },
    { name: "Eclipse", category: "Tools", level: "comfortable" },
    { name: "Azure", category: "Tools", level: "comfortable" },
    { name: "Vercel", category: "Tools", level: "comfortable" },
    { name: "MySQL", category: "Tools", level: "comfortable" },
    { name: "Slack", category: "Tools", level: "comfortable" },
    { name: "PyInstaller", category: "Tools", level: "comfortable" },
    { name: "Ollama", category: "Tools", level: "learning" },
  ],

  contact: {
    intro:
      "I'm always open to new opportunities, internships, and collaborations. Feel free to reach out — I'd love to connect.",
    email: "gonz2004@icloud.com",
    github: {
      url: "https://github.com/bwpx",
      label: "bwpx",
    },
    linkedin: {
      url: "https://www.linkedin.com/in/martin-gonzalez-481942263/",
      label: "Martin Gonzalez",
    },
  },

  footer: {
    text: "Martin Gonzalez © 2026. All rights reserved.",
  },
};
