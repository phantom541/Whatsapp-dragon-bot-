import crypto from "crypto";
import { CARDS } from "../data/cards.js";

export function generateCaptcha() {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
}

export function priceFromTier(tier) {
  const base = {
    1: 500,
    2: 1200,
    3: 3000,
    4: 6500,
    5: 12000,
    6: 25000,
    S: 50000
  };
  return base[tier] ?? 1000;
}

export function weightedRandomCard() {
  const pool = [];

  for (const card of CARDS) {
    const weight = Math.max(1, 7 - (parseInt(card.tier) || 1));
    for (let i = 0; i < weight; i++) pool.push(card);
  }

  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function pullPack(size = 3) {
  const pulled = [];
  for (let i = 0; i < size; i++) {
    const card = weightedRandomCard();
    if (card) pulled.push(card);
  }
  return pulled;
}
