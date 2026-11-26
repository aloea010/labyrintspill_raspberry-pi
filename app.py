from flask import Flask, render_template, request, jsonify
import pymysql

app = Flask(__name__)

def get_db():
    return pymysql.connect(
        host="localhost",
        user="alex",
        password="DITT_PASSORD",
        database="mazegame",
        cursorclass=pymysql.cursors.DictCursor
    )

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/scores", methods=["GET"])
def get_scores():
    db = get_db()
    with db.cursor() as cursor:
        cursor.execute("SELECT name, time, moves, secret_walls FROM scores ORDER BY time DESC LIMIT 5")
        top_scores = cursor.fetchall()
    db.close()
    return jsonify(top_scores)

@app.route("/api/scores", methods=["POST"])
def add_score():
    data = request.get_json()
    name = data.get("name", "Anonym")
    time_left = data.get("time", 0)
    moves = data.get("moves", 0)
    secret_walls = data.get("secret_walls", 0)
    db = get_db()
    with db.cursor() as cursor:
        cursor.execute(
            "INSERT INTO scores (name, time, moves, secret_walls) VALUES (%s, %s, %s, %s)",
            (name, time_left, moves, secret_walls)
        )
    db.commit()
    db.close()
    return jsonify({"status": "ok"}), 201

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)