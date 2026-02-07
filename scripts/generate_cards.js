import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.resolve('./database/cards.json');

// 20 series for variety
const SERIES_COUNT = 20;

// Weighted tiers
const TIER_WEIGHTS = { '1': 45, '2': 35, '3': 25, '4': 20, '5': 15, '6': 11, 'S': 5 };

// Sample real URLs
const IMAGE_URLS = [
  'https://images.pokemontcg.io/base1/1_hires.png',
  'https://images.pokemontcg.io/base1/4_hires.png',
  'https://images.pokemontcg.io/base1/7_hires.png',
  'https://images.pokemontcg.io/base1/10_hires.png',
  'https://images.pokemontcg.io/base1/12_hires.png',
  'https://images.pokemontcg.io/base1/14_hires.png',
  'https://images.pokemontcg.io/base1/15_hires.png',
  'https://images.pokemontcg.io/base1/16_hires.png',
  'https://images.pokemontcg.io/base1/18_hires.png',
  'https://images.pokemontcg.io/base1/20_hires.png'
];

// Pick a weighted tier
function randomTier() {
  const tiers = Object.keys(TIER_WEIGHTS);
  const total = tiers.reduce((a, t) => a + TIER_WEIGHTS[t], 0);
  let r = Math.random() * total;
  for (const t of tiers) {
    if (r < TIER_WEIGHTS[t]) return t;
    r -= TIER_WEIGHTS[t];
  }
  return '1';
}

// Generate card ID
function genId(i) {
  return `c${i.toString().padStart(5, '0')}`;
}

// Assign an image from URL array
function imageURL(i) {
  return IMAGE_URLS[i % IMAGE_URLS.length];
}

async function main() {
  const cards = {};

  for (let i = 1; i <= 5000; i++) {
    const id = genId(i);
    const tier = randomTier();
    const card = {
      id,
      name: `Card #${i}`,
      tier,
      series: `Series ${((i - 1) % SERIES_COUNT) + 1}`,
      price: Math.floor(Math.random() * 1000) + 100,
      spawnable: true,
      owners: [],
      maxOwners: 5,
      image: imageURL(i - 1)
    };
    cards[id] = card;
  }

  const data = { cards };
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
  console.log('✅ 5000 cards generated with real URLs!');
}

main().catch(console.error);
