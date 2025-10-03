export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method allowed" });
  }

  const { oldPrice, newPrice, products } = req.body;
  if (!oldPrice || !newPrice || !products) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const percentChange = ((Number(newPrice) - Number(oldPrice)) / Number(oldPrice)) * 100;

  const prompt = `
قیمت قبلی درهم: ${oldPrice}
قیمت فعلی درهم: ${newPrice}
درصد تغییر: ${percentChange.toFixed(2)}%

لیست محصولات (قیمت به تومان):
${products}

لطفاً قیمت هر محصول را با همین درصد تغییر (${percentChange.toFixed(2)}%) آپدیت کن و متن را با همان قالب اولیه بازگردان.
  `;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    const output = data.choices?.[0]?.message?.content || "No response";
    res.status(200).json({ output });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
