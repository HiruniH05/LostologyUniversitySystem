export async function getCategoryFromVision(base64Image: string): Promise<string | null> {
  const apiKey = import.meta.env.VITE_VISION_API_KEY;
  const url = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

  const body = {
    requests: [
      {
        image: { content: base64Image },
        features: [{ type: "LABEL_DETECTION", maxResults: 10 }],
      },
    ],
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    console.log("Vision API Response:", data);

    const labels = data.responses?.[0]?.labelAnnotations || [];
    if (!labels.length) return null;

    const labelNames = labels.map((l: any) => l.description.toLowerCase());

    const match = (keywords: string[]) =>
      labelNames.some((l: string) => keywords.some(k => l.includes(k)));

    // 🔑 Map Vision labels → your categories
    if (match(["phone", "mobile", "cellphone", "laptop", "computer", "electronics", "tablet", "camera"])) {
      return "Electronics";
    }
    if (match(["book", "novel", "textbook", "notebook"])) {
      return "Books";
    }
    if (match(["clothes", "shirt", "t-shirt", "pants", "dress", "jacket", "jeans", "wear"])) {
      return "Clothing";
    }
    if (match(["bag", "backpack", "handbag", "purse", "suitcase"])) {
      return "Accessories";
    }
    if (match(["id card", "passport", "identity", "license", "driving"])) {
      return "IDs";
    }

    return "Other"; // fallback
  } catch (err) {
    console.error("Vision API error:", err);
    return null;
  }
}
