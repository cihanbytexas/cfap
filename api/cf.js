import crypto from "crypto";

function randomFloat() {
  const buf = crypto.randomBytes(4);
  const hex = buf.readUInt32BE(0);
  return hex / 0xffffffff;
}

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Sadece POST destekleniyor" });
  }

  const { user, amount, mode, plusChance } = req.body;

  if (!user || !amount || amount <= 0) {
    return res.status(400).json({ error: "Geçersiz parametre" });
  }

  let baseChance = 0.5;
  let multiplier = 1;

  if (mode === "cf+") {
    baseChance = plusChance !== undefined ? plusChance : 0.6;
    multiplier = 1.5;
  } else if (mode === "cf++") {
    baseChance = plusChance !== undefined ? plusChance : 0.4;
    multiplier = 2;
  }

  const win = randomFloat() < baseChance;
  const bonus = win ? amount * (Math.random() * 0.2) : 0;
  const change = win ? amount * multiplier + bonus : -amount;

  const message = win
    ? `💰 **${user} Kazandı!**\nBahis: ${amount} EnCoins\nÇarpan: x${multiplier}\nBonus: +${Math.round(bonus)}\n**Toplam Kazanç: +${Math.round(change)} EnCoins**`
    : `❌ **${user} Kaybetti!**\nBahis: ${amount} EnCoins\nÇarpan: x${multiplier}\nBonus: +${Math.round(bonus)}\n**Toplam Kayıp: ${Math.round(change)} EnCoins**`;

  res.status(200).json({
    user,
    bet: amount,
    mode: mode || "cf",
    win,
    multiplier,
    bonus: Math.round(bonus),
    change: Math.round(change),
    message,
  });
}
