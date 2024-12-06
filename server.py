from flask import Flask, send_from_directory

app = Flask(__name__)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')  # Serve index.html from the root directory

@app.route('/data/communes/<filename>')
def commune_data(filename):
    return send_from_directory('data/communes', filename)  # Serve data from the data/communes folder

if __name__ == '__main__':
    app.run(debug=True)
