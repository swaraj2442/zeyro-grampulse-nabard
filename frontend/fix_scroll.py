import re
import os

def fix_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Update the IntersectionObserver logic
    new_observer_logic = """  useEffect(() => {
    const handleScroll = () => {
      const sections = Array.from(document.querySelectorAll("section[id]"));
      if (sections.length === 0) return;
      
      let current = sections[0].id;
      const targetLine = 200; // Trigger line 200px from top

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const rect = section.getBoundingClientRect();
        if (rect.top <= targetLine) {
          current = section.id;
        } else {
          // If this section is below the target line, check if we're seeing it on screen at all
          // This helps with very short sections
          break;
        }
      }

      // If scrolled to absolute bottom, force last section active
      const isBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;
      if (isBottom) {
        current = sections[sections.length - 1].id;
      }

      setActiveSection((prev) => (prev !== current ? current : prev));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);"""

    # We need to replace the existing useEffect for IntersectionObserver
    pattern_observer = re.compile(r'  useEffect\(\(\) => \{\n    const observer = new IntersectionObserver\(.*?\n    \};\n  \}, \[\]\);', re.DOTALL)
    
    # Check if the regex matches, if not it means the structure changed or my regex is slightly off
    if not pattern_observer.search(content):
        # Alternative simple string replacement
        start_idx = content.find('  useEffect(() => {\n    const observer = new IntersectionObserver(')
        end_idx = content.find('  }, []);', start_idx) + len('  }, []);')
        if start_idx != -1:
            content = content[:start_idx] + new_observer_logic + content[end_idx:]
    else:
        content = pattern_observer.sub(new_observer_logic, content)

    # 2. Update the activeSectionProgress logic
    new_progress_logic = """  useMotionValueEvent(scrollY, "change", () => {
    const el = document.getElementById(activeSection);
    if (el) {
      const rect = el.getBoundingClientRect();
      const windowHalf = window.innerHeight / 2;
      const scrolled = windowHalf - rect.top;
      let p = scrolled / rect.height;
      p = Math.max(0, Math.min(1, p));
      
      const isBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;
      if (isBottom && activeSection === links[links.length - 1].id) {
        p = 1;
      }
      
      activeSectionProgress.set(p);
    }
  });"""

    start_progress = content.find('  useMotionValueEvent(scrollY, "change", () => {')
    end_progress = content.find('  });\n\n  useEffect(() => {')
    if end_progress == -1: # just in case
        end_progress = content.find('  });\n', start_progress) + len('  });')
        
    if start_progress != -1 and end_progress != -1:
        content = content[:start_progress] + new_progress_logic + content[end_progress:]

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)


def main():
    fix_file("d:\\zbiz-web\\src\\app\\privacy\\page.tsx")
    fix_file("d:\\zbiz-web\\src\\app\\terms\\page.tsx")
    print("Files updated successfully.")

if __name__ == "__main__":
    main()
