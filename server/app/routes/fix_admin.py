import re

# Read the current file
with open('spaces.py', 'r') as f:
    content = f.read()

# Find the admin POST route and change it to GET,POST
content = re.sub(
    r"@spaces_bp\.route\('/admin/spaces', methods=\['POST'\]\)",
    "@spaces_bp.route('/admin/spaces', methods=['GET', 'POST'])",
    content
)

# Find the admin_spaces function and add GET logic
content = re.sub(
    r'def create_space\(\):',
    'def admin_spaces():\n    if request.method == "GET":\n        spaces = Space.query.all()\n        return jsonify([space.to_dict() for space in spaces]), 200\n    \n    # POST logic below',
    content
)

# Also rename the function call in the route
content = re.sub(
    r'create_space',
    'admin_spaces',
    content
)

# Write back
with open('spaces.py', 'w') as f:
    f.write(content)

print("Fixed admin endpoint")
