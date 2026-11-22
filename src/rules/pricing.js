// Pricing helpers. Group discount: 10% off a class when 3 or more seats are booked.

export const GROUP_DISCOUNT_MIN_SEATS = 3;
export const GROUP_DISCOUNT_RATE = 0.1;

export function calculateLine(pricePKR, seats) {
  const subtotal = pricePKR * seats;
  const discount = seats >= GROUP_DISCOUNT_MIN_SEATS ? Math.round(subtotal * GROUP_DISCOUNT_RATE) : 0;
  return { subtotal, discount, total: subtotal - discount };
}

/** lines: [{ cls, seats }] -> derived totals for the whole plan. */
export function summarizePlan(lines) {
  return lines.reduce(
    (acc, { cls, seats }) => {
      const line = calculateLine(cls.pricePKR, seats);
      return {
        classCount: acc.classCount + 1,
        seatCount: acc.seatCount + seats,
        durationMinutes: acc.durationMinutes + cls.durationMin,
        subtotal: acc.subtotal + line.subtotal,
        discount: acc.discount + line.discount,
        total: acc.total + line.total,
      };
    },
    { classCount: 0, seatCount: 0, durationMinutes: 0, subtotal: 0, discount: 0, total: 0 },
  );
}
