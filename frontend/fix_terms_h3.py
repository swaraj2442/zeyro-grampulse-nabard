import re
import os

def fix_terms_h3(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Replace the h3 tags that wrap full paragraphs with p tags
    # <h3 className="text-lg text-slate-800 mt-8 mb-3 tracking-tight">...</h3>
    # becomes:
    # <p className="mb-4 text-slate-600">...</p>
    
    pattern = re.compile(r'<h3 className="text-lg text-slate-800 mt-8 mb-3 tracking-tight">(.*?)</h3>')
    
    # Check if there are any that actually *should* be h3? 
    # In terms.md, almost all "X.Y " are full paragraphs, so they should be text-slate-600.
    
    new_content = pattern.sub(r'<p className="mb-4 text-slate-600">\1</p>', content)
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)
    
    print("Fixed terms font styling.")

if __name__ == "__main__":
    fix_terms_h3("d:\\zbiz-web\\src\\app\\terms\\page.tsx")
