from flask import Flask, render_template, request, jsonify, redirect, url_for, session
import sqlite3
import random
import datetime

app = Flask(__name__)
app.secret_key = "supersecretkey"

def init_db():
    conn = sqlite3.connect("scores.db")
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS scores
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  game TEXT,
                  score INTEGER,
                  date TEXT,
                  reliability TEXT)''')
    conn.commit()
    conn.close()

init_db()

# --- LOGIN ROUTE ---
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username")
        # You can add password logic here if needed
        if username:
            session['user'] = username
            # Clear previous session progress
            session.pop('readiness', None)
            session.pop('calibration_passed', None)
            session.pop('attention_done', None)
            return redirect(url_for('readiness'))
        else:
            return render_template("login.html", error="Please enter a username.")
    return render_template("login.html")

# --- MAIN FLOW ROUTE ---
@app.route("/")
def home():
    # Only show games if all steps are passed
    if 'user' not in session:
        return redirect(url_for('login'))
    if 'readiness' not in session or session['readiness'] < 60:
        return redirect(url_for('readiness'))
    if 'calibration_passed' not in session or not session['calibration_passed']:
        return redirect(url_for('calibration'))
    if 'attention_done' not in session or not session['attention_done']:
        return redirect(url_for('attention_warmup'))
    return render_template("games.html")  # <-- show games.html here

# --- READINESS ---
@app.route("/readiness")
def readiness():
    if 'user' not in session:
        return redirect(url_for('login'))
    return render_template('readiness.html')

@app.route('/submit_readiness', methods=['POST'])
def submit_readiness():
    sleep = int(request.form['sleep'])
    mood = request.form['mood']
    caffeine = request.form['caffeine']
    distraction = request.form['distraction']
    fatigue = int(request.form['fatigue'])

    # calculate Readiness Index (RI)
    score = 0
    if sleep <= 4:
        score += 10
    elif 5 <= sleep <= 6:
        score += 20
    else:
        score += 30
    if mood == "happy":
        score += 20
    elif mood == "neutral":
        score += 15
    else:
        score += 5
    if caffeine == "yes":
        score -= 10
    if distraction == "yes":
        score -= 20
    score += max(0, 30 - (fatigue * 6))

    session['readiness'] = score
    session.pop('calibration_passed', None)
    session.pop('attention_done', None)

    print("Readiness score calculated:", score)  # Debug print

    if score < 60:
        return render_template("reschedule.html", score=score)
    else:
        return redirect(url_for('calibration'))

# --- CALIBRATION ---
@app.route('/calibration')
def calibration():
    if 'user' not in session:
        return redirect(url_for('login'))
    if 'readiness' not in session or session['readiness'] < 60:
        return redirect(url_for('readiness'))
    return render_template('calibration.html')

@app.route('/submit_calibration', methods=['POST'])
def submit_calibration():
    rt = float(request.form['reaction_time'])
    memory_correct = int(request.form['memory_correct'])

    fail = False
    reasons = []
    if rt > 1000:
        fail = True
        reasons.append("Your reaction speed was slower than expected.")
    if memory_correct < 2:
        fail = True
        reasons.append("Your short-term memory check was too low.")

    if fail:
        session['calibration_passed'] = False
        return render_template("reschedule.html", score=session.get("readiness", 0), reasons=reasons)
    else:
        session['calibration_passed'] = True
        return redirect(url_for('attention_warmup'))

# --- ATTENTION WARM-UP ---
@app.route("/attention_warmup", methods=["GET", "POST"])
def attention_warmup():
    if 'user' not in session:
        return redirect(url_for('login'))
    if 'readiness' not in session or session['readiness'] < 60:
        return redirect(url_for('readiness'))
    if 'calibration_passed' not in session or not session['calibration_passed']:
        return redirect(url_for('calibration'))
    if request.method == "POST":
        # Mark attention warm-up as done
        session['attention_done'] = True
        return redirect(url_for('home'))
    return render_template("attention_warmup.html")

# --- LOGOUT ---
@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for('login'))

# --- GAMES & RESULTS ---
@app.route("/memory-match")
def memory_match():
    return render_template("memory_match.html")

@app.route("/story-recall")
def story_recall():
    stories = [
        {
            "id": 1,
            "text": "John went to the market and bought apples, bananas, and oranges before heading home.",
            "questions": [
                {"q": "What fruit did John NOT buy?", "options": ["Apples", "Bananas", "Oranges", "Grapes"], "answer": "Grapes"},
                {"q": "Where did John go?", "options": ["School", "Market", "Park", "Office"], "answer": "Market"}
            ]
        },
        {
            "id": 2,
            "text": "Emma visited her grandmother every Sunday and they baked cookies together.",
            "questions": [
                {"q": "What day did Emma visit?", "options": ["Monday", "Sunday", "Friday", "Saturday"], "answer": "Sunday"},
                {"q": "What did Emma and her grandmother bake?", "options": ["Cake", "Cookies", "Pie", "Bread"], "answer": "Cookies"}
            ]
        }
    ]
    story = random.choice(stories)
    return render_template("story_recall.html", story=story)

@app.route("/results")
def results():
    conn = sqlite3.connect("scores.db")
    c = conn.cursor()
    c.execute("SELECT game, score, date, reliability FROM scores")
    rows = c.fetchall()
    conn.close()
    return render_template("results.html", scores=rows)

@app.route("/save_score", methods=["POST"])
def save_score():
    data = request.json
    game = data.get("game")
    score = data.get("score")
    reliability = data.get("reliability", "")
    date = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    conn = sqlite3.connect("scores.db")
    c = conn.cursor()
    c.execute("INSERT INTO scores (game, score, date, reliability) VALUES (?, ?, ?, ?)", (game, score, date, reliability))
    conn.commit()
    conn.close()
    return jsonify({"status": "success"})

# --- RESCHEDULE ---
@app.route("/reschedule")
def reschedule():
    score = session.get('readiness', 0)
    reason = request.args.get('reason', '')
    reasons = []
    if reason:
        reasons.append(reason)
    return render_template("reschedule.html", score=score, reasons=reasons)

if __name__ == "__main__":
    app.run(debug=True)
