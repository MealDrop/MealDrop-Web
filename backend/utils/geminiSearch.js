const MODEL = "gemini-2.0-flash";

function keywordFallback(query, restaurants) {
  const q = query.toLowerCase();
  const matches = restaurants
    .map((r) => {
      const cuisineHit = (r.cuisines || []).find((c) =>
        q.includes(c.toLowerCase()),
      );
      const dishHit = r.dishes.find(
        (d) =>
          q.includes(d.name.toLowerCase()) ||
          q.includes((d.category || "").toLowerCase()),
      );
      const nameHit = q.includes(r.name.toLowerCase());
      if (!cuisineHit && !dishHit && !nameHit) return null;
      const reason = dishHit
        ? `has ${dishHit.name}`
        : cuisineHit
          ? `serves ${cuisineHit}`
          : "name match";
      return { restaurantId: r.id, reason };
    })
    .filter(Boolean);
  return { matches, usedFallback: true };
}

async function smartSearch(query, restaurants) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return keywordFallback(query, restaurants);

  const menu = restaurants.map((r) => ({
    id: r.id,
    name: r.name,
    cuisines: r.cuisines || [],
    priceForTwo: r.priceForTwo || null,
    isOpen: r.isOpen,
    dishes: r.dishes.map((d) => ({
      name: d.name,
      category: d.category,
      price: d.price,
      isVeg: d.isVeg,
    })),
  }));

  const prompt = `You are the search engine for a food-ordering app in Barasat, India.
A customer typed this search: "${query}"

Here is the current menu data as JSON:
${JSON.stringify(menu)}

Return ONLY JSON matching this shape, nothing else:
{"matches": [{"restaurantId": "<id>", "reason": "<short phrase, under 6 words, e.g. 'has chicken biryani under ₹300'>"}], "message": "<one short sentence summarizing the results for the customer>"}

Rules:
- Only include restaurants that genuinely match the query (cuisine, dish name, price limit, veg/non-veg, "open now", etc).
- Order matches best-first.
- If nothing matches, return an empty matches array and an honest message.
- Never invent a restaurant or dish that isn't in the menu data.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      },
    );
    if (!res.ok) throw new Error(`Gemini API responded ${res.status}`);
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed.matches))
      throw new Error("Unexpected Gemini response shape");
    return {
      matches: parsed.matches,
      message: parsed.message,
      usedFallback: false,
    };
  } catch (err) {
    console.error("Gemini search failed, using keyword fallback:", err.message);
    return keywordFallback(query, restaurants);
  }
}

module.exports = { smartSearch };
