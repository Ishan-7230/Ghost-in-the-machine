import os
import re

filepath = 'ssh_honeypot/visual_deception.py'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for idx, line in enumerate(lines):
    # Fix Image.new colors
    if re.search(r'Image\.new\("RGB", \([^,]+, [^\)]+\), "\s*$', line):
        line = line.replace('"', '"#FFFFFF")\n', 2) # replace second quote
        # actually a bit hacky, let's just do:
        line = line.rstrip()[:-1] + '"#FFFFFF")\n'
    
    # Fix fill="
    elif re.search(r'fill="\s*$', line):
        line = line.rstrip()[:-1] + '"#000000")\n'
    
    # Fix Xk9
    elif 'Xk9' in line and line.rstrip().endswith('Xk9'):
        line = line.rstrip() + '#p0!")\n'
        if 'f"- DB Master' in line:
            line = line.replace('!)', '!)\",')
            
    # Fix AUDIT
    elif '- AUDIT' in line and line.rstrip().endswith('wallet'):
        line = line.rstrip() + ' #4",\n'
        
    # Fix ("label", "ip", "
    elif line.strip().startswith('(') and '\\n' in line and line.rstrip().endswith(', "'):
        line = line.rstrip()[:-1] + '"#89B4FA"),\n'
        
    new_lines.append(line)

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Fixed visual_deception.py strings!")
