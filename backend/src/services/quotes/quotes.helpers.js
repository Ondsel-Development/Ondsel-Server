import {QUOTE_LIFESPAN} from "./quotes.subdocs.schema.js";

export function calculateRemainingAge(quote) {
  let remainingSeconds = 0;
  const quoteDate = quote.createdAt;
  if (!quoteDate) {
    return 0;
  }
  const now = Date.now()
  const age = now - quoteDate;
  const quoteLength = QUOTE_LIFESPAN[quote.source];
  remainingSeconds = quoteLength - age;
  if (remainingSeconds <= 0) {
    remainingSeconds = 0;
  }
  let remainingDays = remainingSeconds / (60 * 60 * 24);
  if (remainingDays > 4) {
    remainingDays = Math.floor(remainingDays); // (n) whole number
  } else {
    remainingDays = Math.floor(remainingDays * 10) / 10; // (n.n) tenths
  }
  return remainingDays;
}
