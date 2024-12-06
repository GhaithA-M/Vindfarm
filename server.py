from flask import Flask, send_from_directory

app = Flask(__name__, static_folder='static', template_folder='templates')

@app.route('/')
def index():
    return send_from_directory('templates', 'index.html')

@app.route('/data/communes/<filename>')
def commune_data(filename):
    return send_from_directory('data/communes', filename)

if __name__ == '__main__':
    app.run(debug=True)
