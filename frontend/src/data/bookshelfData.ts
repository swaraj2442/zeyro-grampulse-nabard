// bookshelfData.ts
// Colors were sampled directly from the reference mockup image, so tweaking
// them will move the section away from the original look.

export const palette = {
  bg: "#F0EAD9",          // warm cream page background
  ink: "#241505",         // near-black brown, used for the "Not Nahid" title
  textMuted: "#5C5648",   // nav links, footer copy
  woodLight: "#B97A46",   // shelf plank highlight
  woodDark: "#7C4E2B",    // shelf plank shadow edge
  shadow: "rgba(60, 45, 30, 0.16)", // soft blob shadow cast behind each shelf
  pillBg: "rgba(255, 252, 243, 0.92)",
  pillBorder: "rgba(60, 45, 30, 0.08)",
};

// The book cover colors used across both shelves (sampled from the art).
export const bookColors = {
  terracotta: "#D16B45",
  rust: "#B85C3E",
  mustard: "#D9B15C",
  cream: "#E8CDA0",
  teal: "#5F8B83",
  deepTeal: "#3E5F66",
  brown: "#8C5A34",
};

export type Book3D = {
  id: string;
  title: string; // printed on the spine, and used as the accessible label
  href: string; // route that opens your react-pageflip book design
  coverColor: string;
  spineAccent: string; // thin band near the base of the spine
  width: number; // px, spine width as seen face-on
  height: number; // px, spine height
  textColor: string;
  leaning?: number; // degrees to lean the book left (-) or right (+)
};

// All books combined — order matters! They render left-to-right on the shelf.
// width >= height = flat book (stacked horizontally)
// leaning: negative = leans left, positive = leans right
export const allBooksData: Book3D[] = [

  // --- GROUP 1: Two books leaning right against a straight tall book ---
  { id: "ai-ethics-essay",    title: "AI Ethics",       href: "/books/ai-ethics-essay",    coverColor: bookColors.cream,     spineAccent: bookColors.brown,    width: 40, height: 200, textColor: "#3A2A12", leaning: 12 },
  { id: "react-showcase",     title: "React Guide",     href: "/books/react-showcase",     coverColor: bookColors.teal,      spineAccent: bookColors.mustard,  width: 28, height: 175, textColor: "#F3EAD4", leaning: 8  },
  { id: "short-stories",      title: "Short Stories",   href: "/books/short-stories",      coverColor: bookColors.deepTeal,  spineAccent: bookColors.cream,    width: 30, height: 210, textColor: "#F3EAD4", leaning: 0  },

  // --- GROUP 2: Standalone tall book, then two leaning left ---
  { id: "abstract-photography", title: "Photography",   href: "/books/abstract-photography", coverColor: bookColors.terracotta, spineAccent: bookColors.cream,  width: 36, height: 195, textColor: "#FBF3E4", leaning: 0  },
  { id: "open-source",        title: "Open Source",     href: "/books/open-source",        coverColor: bookColors.rust,      spineAccent: bookColors.teal,     width: 26, height: 170, textColor: "#FBF3E4", leaning: -8 },
  { id: "creative-coding",    title: "Creative Coding", href: "/books/creative-coding",    coverColor: bookColors.brown,     spineAccent: bookColors.mustard,  width: 32, height: 155, textColor: "#F3EAD4", leaning: -14},

  // --- GROUP 3: A book resting on the flat stack (leans right into it) ---
  { id: "css-secrets",        title: "CSS Secrets",     href: "/books/css-secrets",        coverColor: bookColors.rust,      spineAccent: bookColors.mustard,  width: 30, height: 190, textColor: "#FBF3E4", leaning: 0  },
  { id: "ui-animation",       title: "UI Animation",    href: "/books/ui-animation",       coverColor: bookColors.mustard,   spineAccent: bookColors.rust,     width: 24, height: 145, textColor: "#3A2A12", leaning: 15 },

  // --- FLAT STACK (right side) ---
  { id: "design-systems",     title: "Design Systems",  href: "/books/design-systems",     coverColor: bookColors.rust,      spineAccent: bookColors.cream,    width: 170, height: 26, textColor: "#FBF3E4", leaning: 0  },
  { id: "typescript-tips",    title: "TypeScript Tips", href: "/books/typescript-tips",    coverColor: bookColors.deepTeal,  spineAccent: bookColors.cream,    width: 145, height: 22, textColor: "#F3EAD4", leaning: 0  },
  { id: "field-notes",        title: "Field Notes",     href: "/books/field-notes",        coverColor: bookColors.cream,     spineAccent: bookColors.brown,    width: 155, height: 24, textColor: "#3A2A12", leaning: 0  },
];

export const navLinks = [
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Contact", href: "/contact" },
];

export const socialLinks = [
  { label: "X", href: "https://x.com/", icon: "x" as const },
  { label: "Instagram", href: "https://instagram.com/", icon: "instagram" as const },
  { label: "GitHub", href: "https://github.com/", icon: "github" as const },
];
