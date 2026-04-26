import { describe, it, expect } from "vitest";
import { computeAvailableSlots } from "./availabilityService.js";

describe("computeAvailableSlots", () => {
  it("returns empty array when template is empty", () => {
    const slots = computeAvailableSlots({
      timezone: "America/Chicago",
      template: [],
      exceptions: [],
      bookedStartsISO: [],
      fromDate: "2026-05-04",
      toDate: "2026-05-04",
      nowISO: "2026-05-04T00:00:00Z",
    });
    expect(slots).toEqual([]);
  });

  it("emits one slot per hour inside a template block", () => {
    const slots = computeAvailableSlots({
      timezone: "America/Chicago",
      template: [
        { day_of_week: 1, start_time: "09:00:00", end_time: "12:00:00" },
      ],
      exceptions: [],
      bookedStartsISO: [],
      fromDate: "2026-05-04",
      toDate: "2026-05-04",
      nowISO: "2026-05-04T00:00:00Z",
    });
    expect(slots.map((s) => s.start_at)).toEqual([
      "2026-05-04T14:00:00.000Z",
      "2026-05-04T15:00:00.000Z",
      "2026-05-04T16:00:00.000Z",
    ]);
  });

  it("excludes slots that are already booked", () => {
    const slots = computeAvailableSlots({
      timezone: "America/Chicago",
      template: [
        { day_of_week: 1, start_time: "09:00:00", end_time: "12:00:00" },
      ],
      exceptions: [],
      bookedStartsISO: ["2026-05-04T15:00:00.000Z"],
      fromDate: "2026-05-04",
      toDate: "2026-05-04",
      nowISO: "2026-05-04T00:00:00Z",
    });
    expect(slots.map((s) => s.start_at)).toEqual([
      "2026-05-04T14:00:00.000Z",
      "2026-05-04T16:00:00.000Z",
    ]);
  });

  it("excludes slots overlapping an exception", () => {
    const slots = computeAvailableSlots({
      timezone: "America/Chicago",
      template: [
        { day_of_week: 1, start_time: "09:00:00", end_time: "12:00:00" },
      ],
      exceptions: [
        { start_at: "2026-05-04T14:30:00.000Z", end_at: "2026-05-04T15:30:00.000Z" },
      ],
      bookedStartsISO: [],
      fromDate: "2026-05-04",
      toDate: "2026-05-04",
      nowISO: "2026-05-04T00:00:00Z",
    });
    expect(slots.map((s) => s.start_at)).toEqual([
      "2026-05-04T16:00:00.000Z",
    ]);
  });

  it("excludes slots whose start is at or before now", () => {
    const slots = computeAvailableSlots({
      timezone: "America/Chicago",
      template: [
        { day_of_week: 1, start_time: "09:00:00", end_time: "12:00:00" },
      ],
      exceptions: [],
      bookedStartsISO: [],
      fromDate: "2026-05-04",
      toDate: "2026-05-04",
      nowISO: "2026-05-04T15:00:00.000Z",
    });
    expect(slots.map((s) => s.start_at)).toEqual([
      "2026-05-04T16:00:00.000Z",
    ]);
  });

  it("handles multiple blocks per day and a date range", () => {
    const slots = computeAvailableSlots({
      timezone: "America/Chicago",
      template: [
        { day_of_week: 1, start_time: "09:00:00", end_time: "11:00:00" },
        { day_of_week: 1, start_time: "13:00:00", end_time: "14:00:00" },
        { day_of_week: 2, start_time: "09:00:00", end_time: "10:00:00" },
      ],
      exceptions: [],
      bookedStartsISO: [],
      fromDate: "2026-05-04",
      toDate: "2026-05-05",
      nowISO: "2026-05-04T00:00:00Z",
    });
    expect(slots.map((s) => s.start_at)).toEqual([
      "2026-05-04T14:00:00.000Z",
      "2026-05-04T15:00:00.000Z",
      "2026-05-04T18:00:00.000Z",
      "2026-05-05T14:00:00.000Z",
    ]);
  });
});
