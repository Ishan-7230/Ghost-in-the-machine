import os
import ast

def check_syntax():
    for root, dirs, files in os.walk('.'):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        if '.venv' in dirs:
            dirs.remove('.venv')
        if '.git' in dirs:
            dirs.remove('.git')
        
        for f in files:
            if f.endswith('.py'):
                filepath = os.path.join(root, f)
                try:
                    with open(filepath, 'r', encoding='utf-8') as file:
                        ast.parse(file.read(), filename=filepath)
                except SyntaxError as e:
                    print(f"SyntaxError in {filepath} at line {e.lineno}: {e.text.strip() if e.text else ''}")
                except Exception as e:
                    print(f"Error in {filepath}: {e}")

if __name__ == '__main__':
    check_syntax()
