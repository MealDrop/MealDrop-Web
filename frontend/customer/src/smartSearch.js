const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "some",
  "any",
  "me",
  "i",
  "want",
  "need",
  "find",
  "show",
  "get",
  "order",
  "please",
  "food",
  "place",
  "restaurant",
  "for",
  "of",
  "in",
  "under",
  "below",
  "less",
  "than",
  "within",
  "budget",
  "cheap",
  "and",
  "with",
  "craving",
  "something",
  "give",
]);

function extractMaxPrice(q) {
  const m = q.match(
    /(?:under|below|less than|within)\s*(?:₹|rs\.?|rupees)?\s*(\d+)/,
  );
  return m ? parseInt(m[1], 10) : null;
}

function keywords(q) {
  return q
    .replace(/(?:under|below|less than|within)\s*(?:₹|rs\.?|rupees)?\s*\d+/, "")
    .split(/[^a-z0-9]+/)
    .filter((w) => w && !STOPWORDS.has(w));
}

function scoreText(text, terms) {
  const t = text.toLowerCase();
  let score = 0;
  terms.forEach((term) => {
    if (t.includes(term)) score += term.length > 3 ? 2 : 1;
  });
  return score;
}

// dishIndex: [{ id, name, description, category, price, isVeg, restaurantId, restaurantName, restaurantIsOpen }]
export function smartSearch(rawQuery, restaurants, dishIndex) {
  const q = rawQuery.toLowerCase().trim();
  const maxPrice = extractMaxPrice(q);
  const terms = keywords(q);

  if (maxPrice != null && terms.length === 0) {
    const dishes = dishIndex.filter((d) => d.price <= maxPrice);
    if (!dishes.length) {
      return { type: "empty", message: `No dishes found under ₹${maxPrice}.` };
    }
    return {
      type: "dishes",
      dishes,
      message: `${dishes.length} dish${dishes.length !== 1 ? "es" : ""} under ₹${maxPrice}`,
    };
  }

  const restaurantMatches = restaurants
    .map((r) => ({
      r,
      score: scoreText(`${r.name} ${(r.cuisines || []).join(" ")}`, terms),
    }))
    .filter((m) => m.score > 0 && (maxPrice == null || r_ok(m.r, maxPrice)))
    .sort((a, b) => b.score - a.score);

  const dishMatches = dishIndex
    .map((d) => ({
      d,
      score: scoreText(`${d.name} ${d.category} ${d.description || ""}`, terms),
    }))
    .filter((m) => m.score > 0 && (maxPrice == null || m.d.price <= maxPrice))
    .sort((a, b) => b.score - a.score);

  const hasR = restaurantMatches.length > 0;
  const hasD = dishMatches.length > 0;

  if (!hasR && !hasD) {
    return { type: "empty", message: `No matches found for "${rawQuery}".` };
  }

  const priceNote = maxPrice != null ? ` under ₹${maxPrice}` : "";
  if (hasR && !hasD) {
    return {
      type: "restaurants",
      restaurants: restaurantMatches.map((m) => m.r),
      message: `${restaurantMatches.length} restaurant${restaurantMatches.length !== 1 ? "s" : ""} match "${rawQuery}"${priceNote}`,
    };
  }
  if (hasD && !hasR) {
    return {
      type: "dishes",
      dishes: dishMatches.map((m) => m.d),
      message: `${dishMatches.length} dish${dishMatches.length !== 1 ? "es" : ""} match "${rawQuery}"${priceNote}`,
    };
  }
  return {
    type: "mixed",
    restaurants: restaurantMatches.map((m) => m.r),
    dishes: dishMatches.map((m) => m.d),
    message: `Found ${restaurantMatches.length} restaurant${restaurantMatches.length !== 1 ? "s" : ""} and ${dishMatches.length} dish${dishMatches.length !== 1 ? "es" : ""} for "${rawQuery}"${priceNote}`,
  };
}

function r_ok(r, maxPrice) {
  return !r.priceForTwo || r.priceForTwo <= maxPrice * 2.2;
}
