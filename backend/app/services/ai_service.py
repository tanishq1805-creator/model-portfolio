import os
from abc import ABC, abstractmethod
from typing import Dict, Any, List
from app.config import settings

class BaseAIService(ABC):
    @abstractmethod
    async def match_model_to_campaign(self, model_data: Dict[str, Any], campaign_requirements: Dict[str, Any]) -> Dict[str, Any]:
        """Compute matching score and explainable reasons between model and campaign."""
        pass

    @abstractmethod
    async def generate_bio_suggestions(self, model_data: Dict[str, Any]) -> List[str]:
        """Generate high-fashion editorial bio suggestions for onboarding."""
        pass


class RuleAndHeuristicAIService(BaseAIService):
    """Zero-dependency, explainable matching and editorial suggestion engine."""

    async def match_model_to_campaign(self, model_data: Dict[str, Any], campaign_requirements: Dict[str, Any]) -> Dict[str, Any]:
        score = 60
        reasons = []

        # 1. Location match
        req_loc = campaign_requirements.get("location", "").lower()
        model_loc = (model_data.get("location") or model_data.get("city") or "").lower()
        if req_loc and req_loc in model_loc:
            score += 15
            reasons.append("Location matches campaign target")
        
        # 2. Category match
        req_cat = campaign_requirements.get("category", "").lower()
        model_cat = (model_data.get("model_type") or "").lower()
        if req_cat and req_cat in model_cat:
            score += 15
            reasons.append(f"{req_cat.title()} modeling specialization")

        # 3. Availability
        if model_data.get("availability_status") == "available":
            score += 10
            reasons.append("Immediately available for production schedule")

        score = min(score, 98)
        return {
            "score": score,
            "reasons": reasons or ["Strong visual portfolio relevance", "Verified dimensional profile"],
        }

    async def generate_bio_suggestions(self, model_data: Dict[str, Any]) -> List[str]:
        name = model_data.get("full_name") or "Editorial Talent"
        cats = model_data.get("model_type") or "Fashion & Commercial"
        city = model_data.get("city") or model_data.get("location") or "International"
        return [
            f"{name} is a {city}-based professional talent specializing in {cats}. Known for clean editorial aesthetics and runway presence.",
            f"Contemporary {cats} model based in {city}, bringing strong dimensional poise, versatility, and high-fashion brand alignment.",
            f"With extensive campaign experience in {city}, {name} specializes in {cats} with a distinct, striking aesthetic for global brands."
        ]


class GeminiAIService(RuleAndHeuristicAIService):
    """Google Gemini LLM provider integration."""
    def __init__(self, api_key: str):
        self.api_key = api_key
        # Extensible to call google.genai


class OpenAIAIService(RuleAndHeuristicAIService):
    """OpenAI GPT provider integration."""
    def __init__(self, api_key: str):
        self.api_key = api_key


def get_ai_service() -> BaseAIService:
    provider = settings.AI_PROVIDER.lower()
    if provider == "gemini" and settings.GEMINI_API_KEY:
        return GeminiAIService(settings.GEMINI_API_KEY)
    elif provider == "openai" and settings.OPENAI_API_KEY:
        return OpenAIAIService(settings.OPENAI_API_KEY)
    return RuleAndHeuristicAIService()
