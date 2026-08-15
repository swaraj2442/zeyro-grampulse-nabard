import re

with open(r'src/components/Home/ZeyroWhatWeDo.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'\{\/\*.*?\*\/\}', '', content, flags=re.DOTALL)

stack = []
line_num = 1
i = 0
while i < len(content):
    if content[i] == '\n':
        line_num += 1
        i += 1
        continue
    
    if content[i:i+2] == '</':
        m = re.match(r'^</([a-zA-Z0-9\.]+)\s*>', content[i:])
        if m:
            tag = m.group(1)
            if stack and stack[-1][0] == tag:
                stack.pop()
            else:
                opened_at = stack[-1][1] if stack else ''
                print(f'Mismatch: closing {tag} at line {line_num}, stack top: {stack[-1][0] if stack else None} (opened at {opened_at})')
                found = False
                for j in range(len(stack)-1, -1, -1):
                    if stack[j][0] == tag:
                        found = True
                        break
                if not found:
                    print(f'-> EXTRA CLOSING TAG {tag} at line {line_num}')
                else:
                    print(f'-> POPPING missed tags')
                    while stack[-1][0] != tag:
                        print(f'   dropped {stack[-1]}')
                        stack.pop()
                    stack.pop() # pop the match
            i += len(m.group(0))
            continue
    elif content[i] == '<':
        m = re.match(r'^<([a-zA-Z0-9\.]+)([^>]*?)(/?)>', content[i:])
        if m:
            tag = m.group(1)
            is_self_closing = m.group(3) == '/'
            if not is_self_closing and tag not in ['br', 'img', 'input', 'hr', 'path', 'Crosshair']:
                stack.append((tag, line_num))
            i += len(m.group(0))
            continue
    i += 1

print('Remaining in stack:', stack)
