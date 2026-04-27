import { DateTime } from "luxon";
import { supabase } from "../supabaseAdminClient.js";
import { computeAvailableSlots } from "./availabilityService.js";
import { NotificationService } from "./notificationService.js";

const HORIZON_DAYS = 60;

export class AppointmentService {
  static async getById(id) {
    const { data, error } = await supabase
      .from("appointments")
      .select("*, provider:profiles!appointments_provider_id_fkey(id, first_name, last_name), patient:profiles!appointments_patient_id_fkey(id, first_name, last_name)")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  }

  static async listForPatient(patientId) {
    const { data, error } = await supabase
      .from("appointments")
      .select("*, provider:profiles!appointments_provider_id_fkey(id, first_name, last_name)")
      .eq("patient_id", patientId)
      .order("start_at", { ascending: false });
    if (error) throw error;
    return data;
  }

  static async listForProvider(providerId) {
    const { data, error } = await supabase
      .from("appointments")
      .select("*, patient:profiles!appointments_patient_id_fkey(id, first_name, last_name)")
      .eq("provider_id", providerId)
      .order("start_at", { ascending: false });
    if (error) throw error;
    return data;
  }

  static async create({ provider_id, patient_id, start_at, reason }) {
    const startUtc = DateTime.fromISO(start_at, { zone: "utc" });
    if (!startUtc.isValid) {
      throw Object.assign(new Error("Invalid start_at"), { status: 400 });
    }
    const end_at = startUtc.plus({ hours: 1 }).toISO();

    const now = DateTime.utc();
    if (startUtc <= now) {
      throw Object.assign(new Error("Appointment must be in the future"), { status: 400 });
    }
    if (startUtc > now.plus({ days: HORIZON_DAYS })) {
      throw Object.assign(new Error(`Appointment must be within ${HORIZON_DAYS} days`), { status: 400 });
    }

    const { data: link, error: linkErr } = await supabase
      .from("provider_patients")
      .select("id")
      .eq("provider_id", provider_id)
      .eq("patient_id", patient_id)
      .eq("status", "active")
      .maybeSingle();
    if (linkErr) throw linkErr;
    if (!link) {
      throw Object.assign(new Error("Patient is not linked to this provider"), { status: 403 });
    }

    const { data, error } = await supabase
      .from("appointments")
      .insert([{ provider_id, patient_id, start_at: startUtc.toISO(), end_at, reason: reason || null }])
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw Object.assign(new Error("That time was just booked. Please pick another."), { status: 409 });
      }
      throw error;
    }

    // Notification for the provider about a new booking
    try {
      const { data: patient } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", patient_id)
        .single();

      const patientName = patient
        ? `${patient.first_name} ${patient.last_name}`
        : "A patient";

      const startLocal = startUtc.toLocaleString(DateTime.DATETIME_MED);

      await NotificationService.create({
        recipient_id: provider_id,
        sender_id: patient_id,
        type: "appointment_booked",
        message: `${patientName} booked an appointment for ${startLocal}`,
        related_appointment_id: data.id,
      });
    } catch (notifError) {
      console.error("Notification failed (appointment was still booked):", notifError);
    }

    return data;
  }

  static async reschedule(id, { start_at }) {
    const startUtc = DateTime.fromISO(start_at, { zone: "utc" });
    if (!startUtc.isValid) {
      throw Object.assign(new Error("Invalid start_at"), { status: 400 });
    }
    const end_at = startUtc.plus({ hours: 1 }).toISO();

    const now = DateTime.utc();
    if (startUtc <= now) {
      throw Object.assign(new Error("Appointment must be in the future"), { status: 400 });
    }
    if (startUtc > now.plus({ days: HORIZON_DAYS })) {
      throw Object.assign(new Error(`Appointment must be within ${HORIZON_DAYS} days`), { status: 400 });
    }

    const { data, error } = await supabase
      .from("appointments")
      .update({ start_at: startUtc.toISO(), end_at, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw Object.assign(new Error("That time was just booked. Please pick another."), { status: 409 });
      }
      throw error;
    }
    return data;
  }

  static async cancel(id, cancelledByProfileId) {
    const { data, error } = await supabase
      .from("appointments")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancelled_by: cancelledByProfileId || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async getAvailability(providerId, fromDate, toDate) {
    const { data: pd, error: pdErr } = await supabase
      .from("provider_details")
      .select("timezone")
      .eq("profile_id", providerId)
      .maybeSingle();
    if (pdErr) throw pdErr;
    const timezone = pd?.timezone || "America/Chicago";

    const today = DateTime.utc().setZone(timezone).startOf("day");
    const horizonEnd = today.plus({ days: HORIZON_DAYS });
    const from = fromDate
      ? DateTime.fromISO(fromDate, { zone: timezone })
      : today;
    const to = toDate
      ? DateTime.fromISO(toDate, { zone: timezone })
      : horizonEnd;
    const clampedFrom = from < today ? today : from;
    const clampedTo = to > horizonEnd ? horizonEnd : to;

    const { data: template, error: tErr } = await supabase
      .from("provider_availability")
      .select("day_of_week, start_time, end_time")
      .eq("provider_id", providerId);
    if (tErr) throw tErr;

    const { data: exceptions, error: eErr } = await supabase
      .from("provider_availability_exceptions")
      .select("start_at, end_at")
      .eq("provider_id", providerId)
      .lte("start_at", clampedTo.endOf("day").toUTC().toISO())
      .gte("end_at", clampedFrom.startOf("day").toUTC().toISO());
    if (eErr) throw eErr;

    const { data: booked, error: bErr } = await supabase
      .from("appointments")
      .select("start_at")
      .eq("provider_id", providerId)
      .eq("status", "scheduled")
      .gte("start_at", clampedFrom.startOf("day").toUTC().toISO())
      .lte("start_at", clampedTo.endOf("day").toUTC().toISO());
    if (bErr) throw bErr;

    return computeAvailableSlots({
      timezone,
      template: template || [],
      exceptions: exceptions || [],
      bookedStartsISO: (booked || []).map((b) => b.start_at),
      fromDate: clampedFrom.toISODate(),
      toDate: clampedTo.toISODate(),
      nowISO: DateTime.utc().toISO(),
    });
  }
}
