import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppointmentService } from "./appointmentService.js";
import { DateTime } from "luxon";

// ---------- Supabase mock wiring ----------

// Build a chainable mock: every method returns `this` except terminal
// methods (`single`, `maybeSingle`) which resolve via `_result`.
function makeChain(result = { data: null, error: null }) {
  const chain = {
    _result: result,
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn(function () { return Promise.resolve(this._result); }),
    maybeSingle: vi.fn(function () { return Promise.resolve(this._result); }),
  };
  // Make terminal-less chains (like order()) also resolve
  chain.then = undefined; // not thenable by default
  return chain;
}

let currentChain;

vi.mock("../supabaseAdminClient.js", () => {
  const fromFn = vi.fn(() => currentChain);
  return { supabase: { from: fromFn } };
});

// Import the mocked module so we can inspect / reconfigure `from`.
const { supabase } = await import("../supabaseAdminClient.js");

beforeEach(() => {
  currentChain = makeChain();
  supabase.from.mockReset().mockImplementation(() => currentChain);
});

// ---------- 1. getById ----------

describe("AppointmentService.getById", () => {
  it("returns appointment data when found", async () => {
    const fakeAppt = { id: "a1", provider_id: "p1", patient_id: "pt1" };
    currentChain = makeChain({ data: fakeAppt, error: null });

    const result = await AppointmentService.getById("a1");

    expect(result).toEqual(fakeAppt);
    expect(supabase.from).toHaveBeenCalledWith("appointments");
    expect(currentChain.eq).toHaveBeenCalledWith("id", "a1");
    expect(currentChain.single).toHaveBeenCalled();
  });

  it("throws when supabase returns an error", async () => {
    currentChain = makeChain({ data: null, error: { message: "not found", code: "PGRST116" } });

    await expect(AppointmentService.getById("bad-id"))
      .rejects.toEqual({ message: "not found", code: "PGRST116" });
  });
});

// ---------- 2. create ----------

describe("AppointmentService.create", () => {
  const futureISO = DateTime.utc().plus({ days: 2 }).set({ hour: 10, minute: 0, second: 0, millisecond: 0 }).toISO();

  it("creates an appointment when all validations pass", async () => {
    const fakeCreated = { id: "new1", provider_id: "p1", patient_id: "pt1", start_at: futureISO };
    // Two chained from() calls: first for provider_patients link check, second for insert.
    const linkChain = makeChain({ data: { id: "link1" }, error: null });
    const insertChain = makeChain({ data: fakeCreated, error: null });
    let callCount = 0;
    supabase.from.mockImplementation((table) => {
      if (table === "provider_patients") return linkChain;
      // "appointments" for the insert
      callCount++;
      return insertChain;
    });

    const result = await AppointmentService.create({
      provider_id: "p1",
      patient_id: "pt1",
      start_at: futureISO,
      reason: "Check-up",
    });

    expect(result).toEqual(fakeCreated);
    expect(linkChain.eq).toHaveBeenCalledWith("provider_id", "p1");
    expect(linkChain.eq).toHaveBeenCalledWith("patient_id", "pt1");
    expect(linkChain.eq).toHaveBeenCalledWith("status", "active");
  });

  it("throws 400 when start_at is in the past", async () => {
    const pastISO = DateTime.utc().minus({ days: 1 }).toISO();

    await expect(
      AppointmentService.create({ provider_id: "p1", patient_id: "pt1", start_at: pastISO })
    ).rejects.toThrow("Appointment must be in the future");
  });

  it("throws 403 when patient is not linked to provider", async () => {
    const linkChain = makeChain({ data: null, error: null }); // no link found
    supabase.from.mockImplementation(() => linkChain);

    await expect(
      AppointmentService.create({ provider_id: "p1", patient_id: "pt1", start_at: futureISO })
    ).rejects.toThrow("Patient is not linked to this provider");
  });
});

// ---------- 3. reschedule ----------

describe("AppointmentService.reschedule", () => {
  const futureISO = DateTime.utc().plus({ days: 3 }).set({ hour: 14, minute: 0, second: 0, millisecond: 0 }).toISO();

  it("reschedules an appointment to a new valid time", async () => {
    const fakeUpdated = { id: "a1", start_at: futureISO };
    currentChain = makeChain({ data: fakeUpdated, error: null });

    const result = await AppointmentService.reschedule("a1", { start_at: futureISO });

    expect(result).toEqual(fakeUpdated);
    expect(supabase.from).toHaveBeenCalledWith("appointments");
    expect(currentChain.eq).toHaveBeenCalledWith("id", "a1");
  });

  it("throws 400 for an invalid ISO date string", async () => {
    await expect(
      AppointmentService.reschedule("a1", { start_at: "not-a-date" })
    ).rejects.toThrow("Invalid start_at");
  });

  it("throws when the new time exceeds the 60-day horizon", async () => {
    const tooFar = DateTime.utc().plus({ days: 90 }).toISO();

    await expect(
      AppointmentService.reschedule("a1", { start_at: tooFar })
    ).rejects.toThrow(/within 60 days/);
  });
});

// ---------- 4. cancel ----------

describe("AppointmentService.cancel", () => {
  it("cancels an appointment and returns updated data", async () => {
    const fakeCancelled = { id: "a1", status: "cancelled", cancelled_by: "user1" };
    currentChain = makeChain({ data: fakeCancelled, error: null });

    const result = await AppointmentService.cancel("a1", "user1");

    expect(result).toEqual(fakeCancelled);
    expect(supabase.from).toHaveBeenCalledWith("appointments");
    expect(currentChain.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: "cancelled", cancelled_by: "user1" })
    );
    expect(currentChain.eq).toHaveBeenCalledWith("id", "a1");
  });

  it("throws when supabase returns an error", async () => {
    currentChain = makeChain({ data: null, error: { message: "row not found" } });

    await expect(AppointmentService.cancel("bad-id", "user1"))
      .rejects.toEqual({ message: "row not found" });
  });
});
