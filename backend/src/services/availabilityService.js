import { DateTime, Interval } from "luxon";

const SLOT_MINUTES = 60;

/**
 * Pure slot computation. All IO happens in the caller.
 */
export function computeAvailableSlots({
  timezone,
  template,
  exceptions,
  bookedStartsISO,
  fromDate,
  toDate,
  nowISO,
}) {
  const now = DateTime.fromISO(nowISO, { zone: "utc" });
  const bookedSet = new Set(
    bookedStartsISO.map((iso) => DateTime.fromISO(iso, { zone: "utc" }).toISO()),
  );
  const exceptionIntervals = exceptions.map((e) =>
    Interval.fromDateTimes(
      DateTime.fromISO(e.start_at, { zone: "utc" }),
      DateTime.fromISO(e.end_at, { zone: "utc" }),
    ),
  );

  const slots = [];
  let cursor = DateTime.fromISO(fromDate, { zone: timezone }).startOf("day");
  const end = DateTime.fromISO(toDate, { zone: timezone }).endOf("day");

  while (cursor <= end) {
    const dow = cursor.weekday % 7; // luxon: Mon=1..Sun=7 → Sun=0..Sat=6
    const daysTemplate = template.filter((t) => t.day_of_week === dow);

    for (const block of daysTemplate) {
      const [sh, sm] = block.start_time.split(":").map(Number);
      const [eh, em] = block.end_time.split(":").map(Number);
      let slotStart = cursor.set({ hour: sh, minute: sm, second: 0, millisecond: 0 });
      const blockEnd = cursor.set({ hour: eh, minute: em, second: 0, millisecond: 0 });

      while (slotStart.plus({ minutes: SLOT_MINUTES }) <= blockEnd) {
        const slotEnd = slotStart.plus({ minutes: SLOT_MINUTES });
        const slotStartUtc = slotStart.toUTC();
        const slotEndUtc = slotEnd.toUTC();
        const interval = Interval.fromDateTimes(slotStartUtc, slotEndUtc);

        const inPast = slotStartUtc <= now;
        const booked = bookedSet.has(slotStartUtc.toISO());
        const blocked = exceptionIntervals.some((iv) => iv.overlaps(interval));

        if (!inPast && !booked && !blocked) {
          slots.push({
            start_at: slotStartUtc.toISO(),
            end_at: slotEndUtc.toISO(),
          });
        }
        slotStart = slotEnd;
      }
    }
    cursor = cursor.plus({ days: 1 });
  }

  slots.sort((a, b) => a.start_at.localeCompare(b.start_at));
  return slots;
}
