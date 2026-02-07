import fs from "fs";
import path from "path";

const IMAGE_DIR = "./assets/cards";
const OUTPUT_FILE = "./data/cards.js";

// USER: Update this URL to your GitHub repo's raw assets folder
const BASE_URL =
  "https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/assets/cards/";

if (!fs.existsSync(IMAGE_DIR)) {
    fs.mkdirSync(IMAGE_DIR, { recursive: true });
}

const files = fs.readdirSync(IMAGE_DIR);

let idCounter = 1;

const cards = files
  .filter(f => f.endsWith(".png") || f.endsWith(".jpg") || f.endsWith(".webp") || f.endsWith(".webm"))
  .map(file => {
    const name = path.parse(file).name;

    // Expected format: tier1_husrab_arslan_senki
    const [tierPart, ...rest] = name.split("_");

    const tier = parseInt(tierPart.replace("tier", ""), 10) || 1;

    // Attempt to parse source and name
    // If rest has at least 2 parts, assume last 2 are source
    let source = "Unknown";
    let cardName = name;
    if (rest.length >= 2) {
        source = rest.slice(-2).join(" ").replace(/_/g, " ");
        cardName = rest.slice(0, -2).join(" ").replace(/_/g, " ");
    } else if (rest.length === 1) {
        cardName = rest[0].replace(/_/g, " ");
    }

    return {
      id: idCounter++,
      name: capitalize(cardName),
      source: capitalize(source),
      tier,
      image: `${BASE_URL}${file}`
    };
  });

const fileContent = `
export const CARDS = ${JSON.stringify(cards, null, 2)};
`;

fs.writeFileSync(OUTPUT_FILE, fileContent.trim());

console.log("✅ Card registry generated:", cards.length, "cards");

function capitalize(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}
