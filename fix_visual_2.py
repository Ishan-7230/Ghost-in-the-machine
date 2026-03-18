import os

filepath = 'ssh_honeypot/visual_deception.py'
with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

# Fix the broken Image.new calls
text = text.replace('img = Image.new("RGB", (1200, 1600), "img = Image.new("RGB"#FFFFFF")\n', 'img = Image.new("RGB", (1200, 1600), "#FFFFFF")\n')
text = text.replace('img = Image.new("RGB", (1400, 1000), "img = Image.new("RGB"#FFFFFF")\n', 'img = Image.new("RGB", (1400, 1000), "#FFFFFF")\n')
text = text.replace('img = Image.new("RGB", (1200, 900), "img = Image.new("RGB"#FFFFFF")\n', 'img = Image.new("RGB", (1200, 900), "#FFFFFF")\n')
text = text.replace('img = Image.new("RGB", (1200, 1000), "img = Image.new("RGB"#FFFFFF")\n', 'img = Image.new("RGB", (1200, 1000), "#FFFFFF")\n')

# Actually, the replacement in the first script did line.rstrip()[:-1] + '"#FFFFFF")\n'
# Let's see what it actually looks like by printing lines containing Image.new
lines = text.split('\n')
for i, line in enumerate(lines):
    if 'Image.new' in line:
        import re
        lines[i] = re.sub(r'Image\.new\("RGB", \(([^)]+)\).*', r'Image.new("RGB", (\1), "#FFFFFF")', line)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))
