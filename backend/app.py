from flask import Flask, request, jsonify, send_from_directory
import hashlib
import os

app = Flask(__name__, static_folder='../frontend')

@app.route('/')
def index():
    return send_from_directory('../frontend', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('../frontend', path)

@app.route('/about')
def about():
    return send_from_directory('../frontend', 'about.html')

@app.route('/api/hash', methods=['POST'])
def hash_password():
    data = request.json
    password = data.get('password', '')
    
    # SHA-256 Hashing
    sha256_hash = hashlib.sha256(password.encode()).hexdigest()
    
    return jsonify({
        'hash': sha256_hash,
        'method': 'SHA-256'
    })

if __name__ == '__main__':
    app.run(debug=True)
