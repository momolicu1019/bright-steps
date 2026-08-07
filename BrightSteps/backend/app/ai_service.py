
import os
from openai import OpenAI
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", "sk-mock")) if os.getenv("OPENAI_API_KEY") else None

# Fallback templates for offline / no-key mode
FALLBACK_EXPLAIN = {
    "en": "Hi {name}! Let's learn about {concept} together. We will do it step by step. You are doing great!",
    "fil": "Hi {name}! Sabay tayong matuto tungkol sa {concept}. Dahan-dahan lang tayo. Kayang-kaya mo yan!"
}

def explain_concept_simple(concept: str, child_name: str, age: int, language: str, abilities: dict):
    level = abilities.get("cognitive", 2)
    prompt = f"""You are BrightSteps AI Teacher for a {age}-year-old child with special learning needs.
    Explain '{concept}' in very simple language, level {level}/5.
    Use short sentences, encouraging tone, 2-3 steps max.
    Language: {language} (en=English, fil=Tagalog/Filipino mix okay).
    Child name: {child_name}. No diagnosis assumptions. Be warm.
    """
    if not client:
        template = FALLBACK_EXPLAIN.get(language, FALLBACK_EXPLAIN["en"])
        return template.format(name=child_name, concept=concept)
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role":"user","content":prompt}],
        max_tokens=120
    )
    return resp.choices[0].message.content

def analyze_progress(history: list):
    # Simple adaptive algorithm: if accuracy > 80% twice, increase difficulty
    if len(history) < 2:
        return {"next_difficulty": history[-1]["difficulty"] if history else 1, "message": "Keep practicing!"}
    last_two = history[-2:]
    avg_acc = sum(h["accuracy"] for h in last_two)/2
    curr_diff = last_two[-1]["difficulty"]
    if avg_acc > 0.8 and curr_diff < 5:
        return {"next_difficulty": curr_diff+1, "message": "Level up! You're ready for a challenge."}
    if avg_acc < 0.4 and curr_diff > 1:
        return {"next_difficulty": curr_diff-1, "message": "Let's make it easier and try again."}
    return {"next_difficulty": curr_diff, "message": "Great job, keep going!"}

def parent_coach_suggestions(progress_summary: dict, language: str):
    prompt = f"""You are BrightSteps Parent Coach. Given this progress: {progress_summary}
    Give 3 short, practical home activities (no screen) in {language}.
    Include strengths and one gentle area to practice. Encouraging, non-clinical.
    """
    if not client:
        return ["Practice brushing teeth with visual schedule", "Play emotion matching with family photos", "5-min breathing before bedtime"]
    resp = client.chat.completions.create(model="gpt-4o-mini", messages=[{"role":"user","content":prompt}], max_tokens=200)
    return resp.choices[0].message.content.split("\n")
