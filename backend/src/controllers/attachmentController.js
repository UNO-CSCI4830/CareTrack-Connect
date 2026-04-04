import { httpResponse } from "../utils/httpResponse.js";
import { AttachmentService } from "../services/attachmentService.js";

export class AttachmentController {
  static async getAllAttachments(req, res, next) {
    try {
      const attachments = await AttachmentService.getAllAttachments();
      httpResponse.success(res, attachments, 200, "Attachments retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getAttachmentById(req, res, next) {
    try {
      const { id } = req.params;
      const attachment = await AttachmentService.getAttachmentById(id);
      
      if (!attachment) {
        return httpResponse.notFound(res, "Attachment not found");
      }

      httpResponse.success(res, attachment, 200, "Attachment retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getAttachmentsByPatientId(req, res, next) {
    try {
      const { patientId } = req.params;
      const attachments = await AttachmentService.getAttachmentsByPatientId(patientId);
      httpResponse.success(res, attachments, 200, "Attachments for patient retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getAttachmentsByCheckInId(req, res, next) {
    try {
      const { checkInId } = req.params;
      const attachments = await AttachmentService.getAttachmentsByCheckInId(checkInId);
      httpResponse.success(res, attachments, 200, "Attachments for check-in retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getAttachmentsByType(req, res, next) {
    try {
      const { fileType } = req.params;
      const attachments = await AttachmentService.getAttachmentsByType(fileType);
      httpResponse.success(res, attachments, 200, `Attachments of type '${fileType}' retrieved successfully`);
    } catch (error) {
      next(error);
    }
  }

  static async createAttachment(req, res, next) {
    try {
      const attachmentData = req.body;
      
      if (!attachmentData.patient_id || !attachmentData.file_type || !attachmentData.storage_path || !attachmentData.file_name) {
        return httpResponse.badRequest(res, "patient_id, file_type, storage_path, and file_name are required");
      }

      const newAttachment = await AttachmentService.createAttachment(attachmentData);
      httpResponse.created(res, newAttachment, "Attachment created successfully");
    } catch (error) {
      next(error);
    }
  }

  static async updateAttachment(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedAttachment = await AttachmentService.updateAttachment(id, updateData);
      httpResponse.success(res, updatedAttachment, 200, "Attachment updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async deleteAttachment(req, res, next) {
    try {
      const { id } = req.params;
      const deletedAttachment = await AttachmentService.deleteAttachment(id);
      httpResponse.success(res, deletedAttachment, 200, "Attachment deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}
