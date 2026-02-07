import fs from "fs";
import path from "path";
import axios from "axios";

// USER: Update this with your Bing Image Search API key
const BING_API_KEY = process.env.BING_API_KEY;
const ENDPOINT = "https://api.bing.microsoft.com/v7.0/images/search";

// Input: text file with dragon names, one per line
const INPUT_FILE = "./data/dragon_names.txt";
// Output folder for downloaded images
const OUTPUT_DIR = "./assets/dragons";

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

if (!fs.existsSync(INPUT_FILE)) {
    console.error(`❌ Input file ${INPUT_FILE} not found. Please create it with dragon names.`);
    process.exit(1);
}

// Read dragon names from file
const names = fs
  .readFileSync(INPUT_FILE, "utf-8")
  .split("\n")
  .map(n => n.trim())
  .filter(Boolean);

console.log(`🐉 Starting download for ${names.length} dragons...`);

for (const name of names) {
  try {
    if (!BING_API_KEY) {
        console.warn("⚠️ BING_API_KEY not found in environment. Skipping API call for", name);
        continue;
    }

    // Search Bing for "dragon anime"
    const res = await axios.get(ENDPOINT, {
      headers: { "Ocp-Apim-Subscription-Key": BING_API_KEY },
      params: {
        q: `${name} dragon anime`,
        count: 1,           // only need first image
        safeSearch: "Strict"
      }
    });

    const imgUrl = res.data.value?.[0]?.contentUrl;
    if (!imgUrl) {
      console.log("❌ No image found for", name);
      continue;
    }

    // Clean filename (lowercase, underscores)
    const fileName = name.toLowerCase().replace(/[^a-z0-9]/g, "_") + ".jpg";

    // Download image
    const img = await axios.get(imgUrl, { responseType: "arraybuffer" });

    fs.writeFileSync(path.join(OUTPUT_DIR, fileName), img.data);

    console.log("✅ Saved:", name);
  } catch (err) {
    console.log("⚠️ Failed:", name, err.message);
  }
}
