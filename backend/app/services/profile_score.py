from typing import Dict, Any, List

def calculate_profile_completion(profile, measurements=None, portfolio_items=None, experiences=None, social_links=None) -> Dict[str, Any]:
    score = 0
    missing = []

    # 1. Basic Info (25%)
    basic_score = 0
    if profile.full_name:
        basic_score += 5
    if profile.profile_photo:
        basic_score += 10
    else:
        missing.append("Upload a high-resolution profile photo")
    if profile.bio and len(profile.bio) > 20:
        basic_score += 5
    else:
        missing.append("Write a detailed professional bio")
    if profile.location or profile.city:
        basic_score += 5
    else:
        missing.append("Add your primary market/location")
    score += basic_score

    # 2. Professional Details (20%)
    prof_score = 0
    if profile.model_type:
        prof_score += 5
    else:
        missing.append("Select your modeling categories (Editorial, Runway, etc.)")
    if profile.height_cm or profile.height_feet_inches:
        prof_score += 5
    else:
        missing.append("Add your height specifications")
    if profile.experience_level:
        prof_score += 5
    if profile.skills:
        prof_score += 5
    score += prof_score

    # 3. Measurements (15%)
    meas_score = 0
    if measurements and (measurements.bust or measurements.chest) and measurements.waist:
        meas_score += 15
    else:
        missing.append("Provide complete body measurements")
    score += meas_score

    # 4. Portfolio (25%)
    items_count = len(portfolio_items) if portfolio_items else 0
    if items_count >= 6:
        score += 25
    elif items_count >= 3:
        score += 15
        missing.append(f"Add {6 - items_count} more portfolio images for maximum reach")
    elif items_count > 0:
        score += 8
        missing.append(f"Add {6 - items_count} more portfolio images")
    else:
        missing.append("Upload your first editorial portfolio photographs")

    # 5. Experience & Credentials (10%)
    exp_count = len(experiences) if experiences else 0
    if exp_count >= 1:
        score += 10
    else:
        missing.append("Add verified runway, campaign, or commercial experience")

    # 6. Social & Representation (5%)
    if social_links and (social_links.instagram or social_links.website):
        score += 5
    else:
        missing.append("Connect your professional Instagram or portfolio URL")

    # Cap at 100%
    final_score = min(score, 100)
    
    return {
        "percentage": final_score,
        "is_complete": final_score >= 80,
        "missing_items": missing[:4],  # top actionable recommendations
    }
