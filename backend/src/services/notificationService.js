import { supabase } from "../supabaseAdminClient.js";

export class NotificationService {

  // Create documentation of the notification
  static async create({ recipient_id, sender_id, type, message, related_appointment_id }) {
    const { data, error } = await supabase
      .from("notifications")
      .insert([{
        recipient_id,
        sender_id: sender_id || null,
        type,
        message,
        related_appointment_id: related_appointment_id || null,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get all notifications for a user (starting with the newest)
  static async getByRecipientId(recipientId) {
    const { data, error } = await supabase
      .from("notifications")
      .select("*, sender:profiles!notifications_sender_id_fkey(id, first_name, last_name)")
      .eq("recipient_id", recipientId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  // Get the unread notifications for a user
  static async getUnreadByRecipientId(recipientId) {
    const { data, error } = await supabase
      .from("notifications")
      .select("*, sender:profiles!notifications_sender_id_fkey(id, first_name, last_name)")
      .eq("recipient_id", recipientId)
      .eq("status", "unread")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  // Get a single notification by ID
  static async getById(id) {
    const { data, error } = await supabase
      .from("notifications")
      .select("*, sender:profiles!notifications_sender_id_fkey(id, first_name, last_name)")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }

  // Mark a notification as read
  static async updateStatus(id, status) {
    const updateData = { status };
    if (status === "read" || status === "dismissed") {
      updateData.read_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("notifications")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Mark all of the unread notifications as read for a user
  static async markAllRead(recipientId) {
    const { data, error } = await supabase
      .from("notifications")
      .update({ status: "read", read_at: new Date().toISOString() })
      .eq("recipient_id", recipientId)
      .eq("status", "unread")
      .select();

    if (error) throw error;
    return data;
  }
}
