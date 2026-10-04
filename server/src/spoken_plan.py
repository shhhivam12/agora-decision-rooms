"""Conservative bilingual meeting-detail extraction, independent of the voice LLM."""
import re
from datetime import datetime, timedelta, timezone

# Normalise common ASR spellings. Other towns can be entered with an explicit
# city phrase, or as a short answer to a missing-city question.
CITIES = {
    "Delhi": ("delhi", "दिल्ली", "दिली"),
    "Bengaluru": ("bengaluru", "bangalore", "बेंगलुरु", "बैंगलोर", "बंगलौर"),
    "Mumbai": ("mumbai", "bombay", "मुंबई", "मुम्बई"),
    "Chennai": ("chennai", "चेन्नई"),
    "Hyderabad": ("hyderabad", "हैदराबाद"),
    "Pune": ("pune", "पुणे"),
    "Kolkata": ("kolkata", "calcutta", "कोलकाता"),
    "Jaipur": ("jaipur", "जयपुर"),
    "Lucknow": ("lucknow", "लखनऊ"),
    "Dehradun": ("dehradun", "देहरादून"),
    "Noida": ("noida", "नोएडा"),
    "Gurugram": ("gurugram", "gurgaon", "गुरुग्राम", "गुड़गांव"),
}
SHAHDARA = ("shahdara", "shahdra", "शाहदरा", "शादरा", "शाद्रा", "शाहदारा")


def known_location(text):
    lower = text.lower()
    # Hindi ASR sometimes joins filler words and city names (येदिल्ली).
    found = [city for city, aliases in CITIES.items() if any(
        alias in lower if not alias.isascii() else re.search(r"\b" + alias + r"\b", lower)
        for alias in aliases)]
    if len(found) == 1:
        return "Shahdara, Delhi" if found[0] == "Delhi" and any(a in lower for a in SHAHDARA) else found[0]
    if not found and any(a in lower for a in SHAHDARA):
        return "Shahdara, Delhi"
    return None


def extract_meeting(text, awaiting_city=False, today=None):
    lower = text.strip().lower()
    result = {}
    city = known_location(lower)
    # Avoid changing the meeting city from an origin, an alternative, or negation.
    ambiguous = any(w in lower for w in (" or ", " या ", "not in", "नहीं", "don't", " from ", "से चल"))
    if city and not ambiguous:
        result["city"] = city
    elif not city and not ambiguous:
        match = re.search(r"(?:city(?: is|:)?|we(?: are|'re) in|meeting in|शहर(?: है|:)?|जगह(?: है|:)?)\s+(.+)", lower)
        candidate = match.group(1) if match else lower if awaiting_city else ""
        candidate = re.sub(r"^(?:yes|yeah|हाँ|हां|ये|यह)\s*", "", candidate).strip(" .,!।")
        if candidate and len(candidate) <= 80 and (match or len(candidate.split()) <= 4) and not re.search(r"[\d?]|\b(?:rain|weather|tomorrow|thanks|hello|okay|yes|no|hours|home)\b|बारिश|मौसम|धन्यवाद|ठीक|नहीं|घर|घंटे", candidate):
            result["city"] = candidate
    today = today or datetime.now(timezone(timedelta(hours=5, minutes=30))).date()
    if "day after tomorrow" in lower or "परसों" in lower:
        result["date"] = (today + timedelta(days=2)).isoformat()
    elif "tomorrow" in lower or ("कल" in lower and not any(w in lower for w in ("बीते", "था", "थी", "yesterday"))):
        result["date"] = (today + timedelta(days=1)).isoformat()
    elif "today" in lower or "आज" in lower:
        result["date"] = today.isoformat()
    iso = re.search(r"\b(\d{4}-\d{2}-\d{2})\b", lower)
    if iso:
        try:
            result["date"] = datetime.strptime(iso.group(1), "%Y-%m-%d").date().isoformat()
        except ValueError:
            pass
    # Curfews are participant constraints, never the outing's start time.
    if not any(w in lower for w in ("home", "घर", "back by")):
        clock = re.search(r"(?:meet|meeting|start|at|मिलना|मिलें|शुरू|शाम|सुबह)\s*(?:at|को)?\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm|बजे)?", lower)
        if clock:
            hour, minute, suffix = int(clock[1]), int(clock[2] or 0), clock[3]
            if suffix in ("am", "pm") and 1 <= hour <= 12:
                hour = hour % 12 + (12 if suffix == "pm" else 0)
            elif "शाम" in lower and 1 <= hour < 12:
                hour += 12
            if hour <= 23 and minute < 60:
                result["time"] = f"{hour:02d}:{minute:02d}"
    return result
