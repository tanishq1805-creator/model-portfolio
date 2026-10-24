"""
Phase 3 — AI Matching Service
Calculates a compatibility score between a CastingCall and a ModelProfile.
Designed to be provider-agnostic: can later pipe through Gemini / OpenAI embeddings.
"""
from typing import Optional


def calculate_match_score(casting: dict, model: dict) -> dict:
    """
    Returns a score (0-100) and breakdown reasons.

    casting keys: category, location, gender_requirement, min_age, max_age,
                  min_height_cm, max_height_cm, experience_level, skills_required
    model keys:   model_type, city, gender, date_of_birth (YYYY-MM-DD), height_cm,
                  experience_level, skills, availability_status
    """
    score = 0
    reasons = []
    max_points = 0

    # 1. Category match (25 pts)
    max_points += 25
    casting_cat = (casting.get("category") or "").lower()
    model_types = (model.get("model_type") or "").lower()
    if casting_cat and any(casting_cat in t or t in casting_cat for t in model_types.split(",")):
        score += 25
        reasons.append({"label": "Category match", "matched": True})
    else:
        reasons.append({"label": "Category match", "matched": False})

    # 2. Location match (20 pts)
    max_points += 20
    casting_loc = (casting.get("location") or "").lower()
    model_city = (model.get("city") or model.get("location") or "").lower()
    if casting.get("is_remote"):
        score += 20
        reasons.append({"label": "Remote-friendly", "matched": True})
    elif casting_loc and model_city and (casting_loc in model_city or model_city in casting_loc):
        score += 20
        reasons.append({"label": "Location match", "matched": True})
    else:
        reasons.append({"label": "Location match", "matched": False})

    # 3. Height requirement (15 pts)
    max_points += 15
    min_h = casting.get("min_height_cm")
    max_h = casting.get("max_height_cm")
    model_h = model.get("height_cm")
    if not min_h and not max_h:
        score += 15
        reasons.append({"label": "Height requirement", "matched": True, "note": "No restriction"})
    elif model_h:
        if (not min_h or model_h >= min_h) and (not max_h or model_h <= max_h):
            score += 15
            reasons.append({"label": "Height match", "matched": True})
        else:
            reasons.append({"label": "Height match", "matched": False})
    else:
        reasons.append({"label": "Height match", "matched": None, "note": "Height not specified"})

    # 4. Experience level (15 pts)
    max_points += 15
    exp_map = {"beginner": 1, "intermediate": 2, "professional": 3, "expert": 4}
    req_exp = (casting.get("experience_level") or "").lower()
    model_exp = (model.get("experience_level") or "").lower()
    if not req_exp:
        score += 15
        reasons.append({"label": "Experience level", "matched": True, "note": "No restriction"})
    elif model_exp:
        req_val = exp_map.get(req_exp, 0)
        model_val = exp_map.get(model_exp, 0)
        if model_val >= req_val:
            score += 15
            reasons.append({"label": "Experience level", "matched": True})
        else:
            reasons.append({"label": "Experience level", "matched": False})
    else:
        reasons.append({"label": "Experience level", "matched": None, "note": "Experience not specified"})

    # 5. Skills match (10 pts)
    max_points += 10
    req_skills_str = (casting.get("skills_required") or "").lower()
    model_skills_str = (model.get("skills") or "").lower()
    if not req_skills_str:
        score += 10
        reasons.append({"label": "Skills match", "matched": True, "note": "No restriction"})
    else:
        req_skills = set(s.strip() for s in req_skills_str.split(",") if s.strip())
        model_skills = set(s.strip() for s in model_skills_str.split(",") if s.strip())
        overlap = req_skills & model_skills
        if overlap:
            partial = min(10, int(10 * len(overlap) / len(req_skills)))
            score += partial
            reasons.append({"label": "Skills match", "matched": True, "note": f"{len(overlap)}/{len(req_skills)} matched"})
        else:
            reasons.append({"label": "Skills match", "matched": False})

    # 6. Availability (10 pts)
    max_points += 10
    avail = (model.get("availability_status") or "").lower()
    if avail == "available":
        score += 10
        reasons.append({"label": "Availability", "matched": True})
    elif avail == "partially_available":
        score += 5
        reasons.append({"label": "Availability", "matched": True, "note": "Partially available"})
    else:
        reasons.append({"label": "Availability", "matched": False, "note": "Not available"})

    # 7. Gender requirement (5 pts)
    max_points += 5
    req_gender = (casting.get("gender_requirement") or "any").lower()
    model_gender = (model.get("gender") or "").lower()
    if req_gender in ("any", "all", ""):
        score += 5
        reasons.append({"label": "Gender requirement", "matched": True, "note": "Open to all"})
    elif model_gender and (req_gender in model_gender or model_gender in req_gender):
        score += 5
        reasons.append({"label": "Gender requirement", "matched": True})
    else:
        reasons.append({"label": "Gender requirement", "matched": False})

    percentage = int((score / max_points) * 100) if max_points > 0 else 0
    return {
        "score": percentage,
        "label": _score_label(percentage),
        "reasons": reasons,
    }


def _score_label(pct: int) -> str:
    if pct >= 90:
        return "Excellent Match"
    if pct >= 75:
        return "Strong Match"
    if pct >= 60:
        return "Good Match"
    if pct >= 40:
        return "Partial Match"
    return "Low Match"


def score_models_for_casting(casting: dict, models: list[dict]) -> list[dict]:
    """Attach match scores to a list of model dicts, sorted descending."""
    for m in models:
        result = calculate_match_score(casting, m)
        m["match_score"] = result["score"]
        m["match_label"] = result["label"]
        m["match_reasons"] = result["reasons"]
    return sorted(models, key=lambda x: x["match_score"], reverse=True)
