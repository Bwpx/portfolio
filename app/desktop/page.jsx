import Desktop from "@/components/desktop/Desktop";

export const metadata = {
  title: "Martin Gonzalez — Desktop",
  description:
    "An interactive desktop version of Martin Gonzalez's portfolio. Open windows for his background, projects, skills and contact info, or explore with a working terminal.",
};

export const viewport = {
  themeColor: "#0a0a0a",
};

// Full-screen page: renders without the site's navbar and footer.
export default function DesktopPage() {
  return <Desktop />;
}
