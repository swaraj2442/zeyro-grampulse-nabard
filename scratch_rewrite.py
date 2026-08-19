import os
import glob

def rewrite_imports():
    targets = [
        "backend/cmd/grampulse-app/**/*.go",
        "backend/internal/grampulse-app/**/*.go"
    ]
    
    for pattern in targets:
        for filepath in glob.glob(pattern, recursive=True):
            with open(filepath, 'r') as f:
                content = f.read()
            
            # Replace the old module import with the new one
            new_content = content.replace(
                '"github.com/yourusername/grampulse-backend/internal',
                '"github.com/arthazeyro/zeyro-b2b/internal/grampulse-app'
            )
            
            if content != new_content:
                with open(filepath, 'w') as f:
                    f.write(new_content)
                print(f"Updated imports in {filepath}")

if __name__ == "__main__":
    rewrite_imports()
