"""Read-only planning providers. Missing facts stay unknown; no fixture fallback."""
import asyncio
import math
import time
from datetime import date
from urllib.parse import urlparse

import httpx
from spoken_plan import known_location


class PlanningError(Exception):
    def __init__(self, message, needs=None):
        super().__init__(message)
        self.needs = needs or []


def public_link(value):
    """Display links only; never fetch user-supplied or venue-supplied URLs."""
    if not isinstance(value, str):
        return None
    value = value.strip()
    parsed = urlparse(value)
    if parsed.scheme not in ("https", "http") or not parsed.hostname or parsed.username:
        return None
    return value[:500]


class PlanningTools:
    def __init__(self):
        self.cache = {}
        self.cooldowns = {}
        self.overpass_lock = asyncio.Lock()
        self.network = asyncio.Semaphore(3)

    async def get(self, url, params):
        key = (url, str(sorted(params.items())))
        cached = self.cache.get(key)
        if cached and cached[0] > time.time():
            return cached[1]
        if self.cooldowns.get(url, 0) > time.time():
            raise PlanningError("The public provider is busy. Try again in half a minute.")
        async with self.network:
            try:
                async with httpx.AsyncClient(timeout=18, follow_redirects=False) as client:
                    response = await client.get(url, params=params, headers={
                        "User-Agent": "AgoraDecisionRooms/1.0 (local hackathon planning demo)"})
                    if response.status_code in (429, 406):
                        self.cooldowns[url] = time.time() + 30
                    response.raise_for_status()
                    if len(response.content) > 3_000_000:
                        raise PlanningError("The provider returned too much data. Try a smaller area.")
                    result = response.json()
            except (httpx.HTTPError, ValueError) as error:
                raise PlanningError("The public provider could not be reached. Try the check again.") from error
        if len(self.cache) > 150:
            self.cache.clear()
        self.cache[key] = (time.time() + 180, result)
        return result

    async def overpass(self, query):
        # Two documented public instances, sequential and bounded; never fake listings.
        async with self.overpass_lock:
            for endpoint in ("https://overpass.private.coffee/api/interpreter", "https://overpass-api.de/api/interpreter"):
                try:
                    data = await self.get(endpoint, {"data": query})
                    if data.get("remark") or "elements" not in data:
                        raise PlanningError("The venue provider could not complete this search.")
                    return data
                except PlanningError:
                    continue
        raise PlanningError("The public venue services are busy. Try the search again shortly.")

    async def location(self, name):
        if not name.strip():
            raise PlanningError("Set the city or meeting town in the group plan first.", ["city"])
        normalized = known_location(name) or name.strip()
        queries = [normalized.split(",")[0].strip()]
        if "," in normalized:
            queries.append(normalized.rsplit(",", 1)[-1].strip())
        locations = []
        fallback = False
        for i, query in enumerate(queries):
            data = await self.get("https://geocoding-api.open-meteo.com/v1/search", {
                "name": query, "count": 5, "language": "en", "format": "json"})
            locations = data.get("results", [])
            if normalized == "Shahdara, Delhi":
                locations = [p for p in locations if p.get("country_code") == "IN" and
                             ("delhi" in p.get("admin1", "").lower() or "delhi" in p.get("name", "").lower())]
            if locations:
                fallback = i > 0
                break
        if not locations:
            raise PlanningError("That city was not found. Edit the city or use a nearby town, then retry.", ["city"])
        item = locations[0]
        return {"name": ", ".join(filter(None, [item.get("name"), item.get("admin1"), item.get("country")])),
                "lat": item["latitude"], "lon": item["longitude"],
                "timezone": item.get("timezone", "auto"),
                "scopeNote": "Locality not found; using " + queries[-1] + " city centre, not the exact neighbourhood." if fallback else "",
                "scopeNoteHi": "इलाके की जानकारी नहीं मिली; " + queries[-1] + " के शहर केंद्र की जानकारी है, सटीक इलाके की नहीं।" if fallback else ""}

    async def venues(self, plan):
        location = await self.location(plan["city"])
        query = ('[out:json][timeout:12];nwr["amenity"~"^(restaurant|cafe)$"]["name"]'
                 f'(around:3500,{location["lat"]},{location["lon"]});out center tags 120;')
        data = await self.overpass(query)
        candidates = []
        for element in data.get("elements", []):
            tags = element.get("tags", {})
            center = element.get("center", element)
            if "lat" not in center or "lon" not in center or not tags.get("name"):
                continue
            veg = tags.get("diet:vegetarian", "unknown")
            item = {
                "id": f'{element["type"]}/{element["id"]}', "name": tags["name"][:100],
                "lat": center["lat"], "lon": center["lon"],
                "kind": tags.get("amenity", "venue"), "vegetarian": veg,
                "hours": tags.get("opening_hours", "Not listed"),
                "reservation": tags.get("reservation", "unknown"),
                "website": public_link(tags.get("website") or tags.get("contact:website")),
                "phone": (tags.get("phone") or tags.get("contact:phone") or "")[:80],
                "source": f'https://www.openstreetmap.org/{element["type"]}/{element["id"]}',
                "price": None, "indoor": "unknown",
            }
            candidates.append(item)
        # Prefer explicitly tagged vegetarian venues, without hiding unknown options.
        candidates.sort(key=lambda v: (v["vegetarian"] not in ("yes", "only"),
                                       -sum((bool(v["website"]), bool(v["phone"]), v["hours"] != "Not listed", v["reservation"] != "unknown")), v["name"]))
        if not candidates:
            raise PlanningError("No named cafes or restaurants were found within 3.5 km of this city centre. Try a nearby town.")
        return {
            "summary": "Found public venue listings near " + location["name"] + ". Prices, indoor seating and live opening status need confirmation.",
            "summaryHi": location["name"] + " के पास सार्वजनिक लिस्टिंग मिलीं। कीमत, अंदर बैठने की जगह और अभी खुला होने की पुष्टि बाकी है।",
            "detail": "OpenStreetMap contributors may have incomplete or older listings. Vegetarian tags are shown only when listed; budget fit is not verified. " + location.get("scopeNote", ""),
            "detailHi": "OpenStreetMap की जानकारी अधूरी या पुरानी हो सकती है। शाकाहारी जानकारी लिस्टिंग के अनुसार है; बजट में फिट होने की पुष्टि नहीं हुई है। " + location.get("scopeNoteHi", ""),
            "source": "https://www.openstreetmap.org/copyright", "provider": "OpenStreetMap / Overpass",
            "venues": candidates[:4], "location": location,
        }

    async def reservations(self, plan, venue):
        if not venue:
            raise PlanningError("Find venues and select one before checking reservations and hours.", ["venue"])
        # Refresh the exact public listing instead of mistaking cached policy for slots.
        kind, osm_id = venue["id"].split("/")
        if kind not in ("node", "way", "relation"):
            raise PlanningError("This venue listing is not supported. Search again.")
        data = await self.get(f"https://api.openstreetmap.org/api/0.6/{kind}/{int(osm_id)}.json", {})
        rows = data.get("elements", [])
        if not rows:
            raise PlanningError("This public venue listing is no longer available. Search again.")
        tags = rows[0].get("tags", {})
        policy = tags.get("reservation", "unknown")
        label = {"yes": "Reservations accepted", "required": "Reservation required",
                 "recommended": "Reservation recommended", "no": "Reservations not accepted"}.get(policy, "Reservation policy not listed")
        hours = tags.get("opening_hours", "Not listed")
        return {"summary": f'{venue["name"]}: {label.lower()}. Exact table availability is unverified.',
                "summaryHi": venue["name"] + ": " + {"yes": "आरक्षण स्वीकार करते हैं", "required": "आरक्षण ज़रूरी है", "recommended": "आरक्षण की सलाह है", "no": "आरक्षण स्वीकार नहीं करते"}.get(policy, "आरक्षण की नीति नहीं दी गई") + "। खाली टेबल की पुष्टि नहीं हुई है।",
                "detail": f'Listed opening hours: {hours}. This is a public listing, not a live booking system. Contact the venue to confirm your date, time and group size.',
                "detailHi": f"लिस्टिंग में समय: {hours}। यह सार्वजनिक जानकारी है। तारीख, समय और लोगों की संख्या के लिए जगह से सीधे पुष्टि करें।",
                "provider": "OpenStreetMap", "source": venue["source"],
                "policy": policy, "slotsVerified": False, "hours": hours,
                "website": public_link(tags.get("website") or tags.get("contact:website")),
                "phone": (tags.get("phone") or tags.get("contact:phone") or "")[:80]}

    async def weather(self, plan):
        location = await self.location(plan["city"])
        data = await self.get("https://api.open-meteo.com/v1/forecast", {
            "latitude": location["lat"], "longitude": location["lon"], "timezone": "auto",
            "hourly": "temperature_2m,precipitation_probability", "forecast_days": 7})
        hourly = data.get("hourly", {})
        day = plan.get("date") or str(data.get("hourly", {}).get("time", [str(date.today())])[0])[:10]
        hour = int((plan.get("time") or "18:00").split(":")[0])
        indices = [i for i, t in enumerate(hourly.get("time", [])) if t[:10] == day and hour <= int(t[11:13]) < min(hour + 3, 24)]
        rain = [hourly["precipitation_probability"][i] for i in indices if hourly["precipitation_probability"][i] is not None]
        temps = [hourly["temperature_2m"][i] for i in indices if hourly["temperature_2m"][i] is not None]
        if not rain or not temps:
            raise PlanningError("Forecast data is unavailable for that date. Choose a date within the next seven days.", ["date"])
        probability = max(rain)
        return {"summary": f'{location["name"]}: up to {probability}% rain probability, {min(temps):g}–{max(temps):g}°C.',
                "summaryHi": f'{location["name"]}: बारिश की संभावना {probability}% तक, तापमान {min(temps):g}–{max(temps):g}°C।',
                "detail": f'{day}, {hour:02d}:00–{min(hour + 3, 24):02d}:00 ({data.get("timezone", "local time")}). Forecast, not a guarantee. ' +
                          ("Consider an indoor option." if probability >= 40 else "Keep a weather backup.") + " " + location.get("scopeNote", ""),
                "detailHi": f'{day}, {hour:02d}:00–{min(hour + 3, 24):02d}:00 ({data.get("timezone", "local time")})। यह पूर्वानुमान है। ' + ("अंदर वाला विकल्प सोचें।" if probability >= 40 else "मौसम के लिए बैकअप रखें।") + " " + location.get("scopeNoteHi", ""),
                "provider": "Open-Meteo", "source": "https://open-meteo.com/en/docs",
                "rainProbability": probability, "date": day}

    async def travel(self, plan, venue):
        if not venue:
            raise PlanningError("Find venues and select one before checking travel time.", ["venue"])
        if not plan.get("origin"):
            raise PlanningError("Set the meeting town in the group plan. Travel estimates start at its town centre.", ["origin"])
        origin = await self.location(plan["origin"])
        coords = f'{origin["lon"]},{origin["lat"]};{venue["lon"]},{venue["lat"]}'
        data = await self.get("https://router.project-osrm.org/route/v1/driving/" + coords, {"overview": "false"})
        if data.get("code") != "Ok" or not data.get("routes"):
            raise PlanningError("No driving route was found between this meeting town and the venue.")
        route = data["routes"][0]
        minutes = max(1, math.ceil(route["duration"] / 60))
        return {"summary": f'About {minutes} minutes driving to {venue["name"]}, {route["distance"] / 1000:.1f} km.',
                "summaryHi": f'{venue["name"]} तक ड्राइव में करीब {minutes} मिनट, दूरी {route["distance"] / 1000:.1f} किमी।',
                "detail": "From " + origin["name"] + " town centre. OSRM road estimate excludes live traffic, parking and walking. Confirm the meeting point before leaving.",
                "detailHi": origin["name"] + " के केंद्र से। इसमें लाइव ट्रैफिक, पार्किंग और पैदल चलना शामिल नहीं है। निकलने से पहले मिलने की जगह तय करें।",
                "provider": "OSRM / OpenStreetMap", "source": "https://project-osrm.org/",
                "minutes": minutes, "origin": origin["name"]}

    async def run(self, tool, plan, venue):
        if tool == "venues":
            return await self.venues(plan)
        if tool == "reservations":
            return await self.reservations(plan, venue)
        if tool == "weather":
            return await self.weather(plan)
        if tool == "travel":
            return await self.travel(plan, venue)
        raise PlanningError("Choose a supported planning check.")
