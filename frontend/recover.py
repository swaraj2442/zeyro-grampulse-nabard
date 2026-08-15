import json
import re

transcript_path = r"C:\Users\Admin\.gemini\antigravity-ide\brain\24b95b3b-a118-4213-83e9-62b3550e1220\.system_generated\logs\transcript_full.jsonl"
lines = []
with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        data = json.loads(line)
        if data.get('type') == 'VIEW_FILE' and 'ZeyroWhatWeDo.tsx' in data.get('content', ''):
            lines.append(data['content'])

with open('extracted.txt', 'w', encoding='utf-8') as f:
    for content in lines:
        f.write(content + "\n====================\n")

print("Extracted to extracted.txt")
