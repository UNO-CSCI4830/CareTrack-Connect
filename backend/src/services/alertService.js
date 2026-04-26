import { supabase } from "../supabaseAdminClient.js";

// Question UUIDs that trigger critical alerts if scored at max value of 4
const CRITICAL_QUESTION_IDS = [
  "41df571a-f9c2-448f-9809-a65331dab392", // Tremor severity
  "b2dfbfd8-63ce-4ffc-a5ef-3fa1ef22a9b8", // Balance issues / near-falls
  "a9dab3f6-e206-4b2a-b56f-643cc4c12c86", // Medication breakthrough
];

const CRITICAL_SCORE = 4;                           // This is currently the max score for any of our scored questions
const HIGH_TOTAL_THRESHOLD = 25;        // This can be adjusted, but seems like a decent starting point
const CRITICAL_TOTAL_THRESHOLD = 30; // This leaves us with 10 points of room with our current number of questions 

export class AlertService {

  // Evaluate the completed check-in
  static async evaluateCheckIn(checkInId, responses) {
    const alerts = [];

    // Get the check-in to find the patient_id
    const { data: checkIn, error: checkInError } = await supabase
      .from("check_ins")
      .select("patient_id")
      .eq("id", checkInId)
      .single();

    if (checkInError) throw checkInError;

    // Find the provider assigned to the patient
    const { data: providerPatient, error: ppError } = await supabase
      .from("provider_patients")
      .select("provider_id")
      .eq("patient_id", checkIn.patient_id)
      .eq("status", "active")
      .limit(1)
      .single();

    if (ppError || !providerPatient) {
      console.warn(`No active provider found for patient ${checkIn.patient_id}, skipping alert generation`);
      return [];
    }

    const providerId = providerPatient.provider_id;

    // Get question details
    const questionIds = responses
      .filter(r => r.question_id)
      .map(r => r.question_id);

    const { data: questions, error: qError } = await supabase
      .from("questions")
      .select("id, question_text, question_type")
      .in("id", questionIds);

    if (qError) throw qError;

    const questionMap = {};
    questions.forEach(q => { questionMap[q.id] = q; });

    // Check individual responses to critical questions
    for (const response of responses) {
      if (
        CRITICAL_QUESTION_IDS.includes(response.question_id) &&
        response.numeric_value != null &&
        response.numeric_value >= CRITICAL_SCORE
      ) {
        const question = questionMap[response.question_id];
        alerts.push({
          patient_id: checkIn.patient_id,
          provider_id: providerId,
          check_in_id: checkInId,
          alert_type: "critical_single_response",
          severity: "critical",
          message: `Patient scored ${response.numeric_value}/4 on: "${question?.question_text || "Unknown question"}"`,
          question_id: response.question_id,
          score_value: response.numeric_value,
          total_score: null,
        });
      }
    }

    // Check total score
    const totalScore = responses.reduce((sum, r) => {
      return sum + (r.numeric_value != null ? r.numeric_value : 0);
    }, 0);

    if (totalScore >= HIGH_TOTAL_THRESHOLD) {
      const severity = totalScore >= CRITICAL_TOTAL_THRESHOLD ? "critical" : "warning";
      alerts.push({
        patient_id: checkIn.patient_id,
        provider_id: providerId,
        check_in_id: checkInId,
        alert_type: "high_total_score",
        severity,
        message: `Patient total symptom score: ${totalScore}/40`,
        question_id: null,
        score_value: null,
        total_score: totalScore,
      });
    }

    // Insert alerts if needed
    if (alerts.length > 0) {
      const { data, error } = await supabase
        .from("alerts")
        .insert(alerts)
        .select();

      if (error) throw error;
      return data;
    }

    return [];
  }

  static async getAlertsByProviderId(providerId) {
    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .eq("provider_id", providerId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getAlertsByPatientId(patientId) {
    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getAlertById(id) {
    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }

  static async updateAlertStatus(id, status) {
    const updateData = { status };
    if (status === "reviewed" || status === "dismissed") {
      updateData.reviewed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("alerts")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getNewAlertsByProviderId(providerId) {
    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .eq("provider_id", providerId)
      .eq("status", "new")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }
}
