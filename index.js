const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config(); // Make sure your .env file is loaded

const app = express();
const port = 3000;

// ✅ Ensure you’ve added META_API_KEY in your .env file
const META_API_KEY = process.env.META_API_KEY;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send(`
    <style>
      body { font-family: system-ui; max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
      .input-group { margin-bottom: 1rem; }
      label { display: block; margin-bottom: 0.5rem; }
      input, textarea { width: 100%; padding: 0.5rem; }
      button { background: #5c6ac4; color: white; border: none; padding: 0.5rem 1rem; cursor: pointer; }
      .results { margin-top: 2rem; }
    </style>
    <h2>🏷️ Shopify Product Title Optimizer</h2>
    <form method="POST" action="/optimize">
      <div class="input-group">
        <label>Current Product Title:</label>
        <input name="title" required placeholder="Enter your current product title...">
      </div>
      <div class="input-group">
        <label>Product Category:</label>
        <input name="category" placeholder="e.g., Electronics, Fashion, Home Decor...">
      </div>
      <div class="input-group">
        <label>Target Keywords (optional):</label>
        <input name="keywords" placeholder="Enter target keywords, comma separated...">
      </div>
      <button type="submit">✨ Generate SEO Title</button>
    </form>
  `);
});

app.post("/optimize", async (req, res) => {
  const { title, category, keywords } = req.body;

  const prompt = `You are a Shopify SEO expert. Your task is to optimize this product title:
Original Title: "${title}"
Category: "${category}"
Target Keywords: "${keywords}"

Please generate exactly 3 SEO-optimized title variations that:
1. Include relevant keywords naturally
2. Stay under 60 characters
3. Are compelling and clear
4. Follow Shopify's best practices

Format the response as:
Option 1: [optimized title]
Option 2: [optimized title]
Option 3: [optimized title]

Add a brief explanation of why these titles are better for SEO.`;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-4-maverick",
        messages: [
          {
            role: "system",
            content: "You are an expert SEO title optimizer. Provide concise, effective Product title suggestions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 512,
        temperature: 0.7,
        top_p: 0.9
      },
      {
        headers: {
          'Authorization': `Bearer ${META_API_KEY}`,
          'HTTP-Referer': 'https://replit.com',
          'X-Title': 'Replit SEO Title Generator'
        }
      }
    );

    console.log('API Response:', JSON.stringify(response.data, null, 2)); // Better debug output
    const message = response.data.choices[0]?.message;
    console.log('Message:', JSON.stringify(message, null, 2)); // Log the actual message
    const result = message?.content || "No response received.";
    console.log('Final result:', result); // Additional debugging

    res.send(`
      <style>
        body { font-family: system-ui; max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
        .original { color: #637381; }
        .options { margin: 2rem 0; }
        .back { display: inline-block; margin-top: 1rem; color: #5c6ac4; text-decoration: none; }
      </style>
      <h3>📊 SEO Title Suggestions</h3>
      <div class="original">
        <strong>Original Title:</strong> ${title}
      </div>
      <div class="options">
        <pre>${result}</pre>
      </div>
      <a href="/" class="back">← Try Another Title</a>
    `);
  } catch (err) {
    console.error("Meta API error:", err.response?.data || err.message);
    const errorMessage = err.response?.data?.error?.message || err.message;
    res.send(`
      <style>
        body { font-family: system-ui; max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
        .error { color: #dc2626; margin: 1rem 0; }
        .back { display: inline-block; margin-top: 1rem; color: #5c6ac4; text-decoration: none; }
      </style>
      <h3>❌ Error Generating Titles</h3>
      <div class="error">${errorMessage}</div>
      <a href="/" class="back">← Try Again</a>
    `);
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`✅ SEO Title Generator running on http://localhost:${port}`);
});
