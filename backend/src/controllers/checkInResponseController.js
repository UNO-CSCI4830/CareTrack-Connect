import { httpResponse } from "../utils/httpResponse.js";
import { CheckInResponseService } from "../services/checkInResponseService.js";

export class CheckInResponseController {
  static async getAllCheckInResponses(req, res, next) {
    try {
      const responses = await CheckInResponseService.getAllCheckInResponses();
      httpResponse.success(res, responses, 200, "Check-in responses retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getCheckInResponseById(req, res, next) {
    try {
      const { id } = req.params;
      const response = await CheckInResponseService.getCheckInResponseById(id);
      
      if (!response) {
        return httpResponse.notFound(res, "Check-in response not found");
      }

      httpResponse.success(res, response, 200, "Check-in response retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getResponsesByCheckInId(req, res, next) {
    try {
      const { checkInId } = req.params;
      const responses = await CheckInResponseService.getResponsesByCheckInId(checkInId);
      httpResponse.success(res, responses, 200, "Responses for check-in retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getResponsesByQuestionId(req, res, next) {
    try {
      const { questionId } = req.params;
      const responses = await CheckInResponseService.getResponsesByQuestionId(questionId);
      httpResponse.success(res, responses, 200, "Responses for question retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async createCheckInResponse(req, res, next) {
    try {
      const responseData = req.body;
      
      if (!responseData.check_in_id || !responseData.question_id) {
        return httpResponse.badRequest(res, "check_in_id and question_id are required");
      }

      const newResponse = await CheckInResponseService.createCheckInResponse(responseData);
      httpResponse.created(res, newResponse, "Check-in response created successfully");
    } catch (error) {
      next(error);
    }
  }

  static async createMultipleResponses(req, res, next) {
    try {
      const { responses } = req.body;
      
      if (!responses || !Array.isArray(responses) || responses.length === 0) {
        return httpResponse.badRequest(res, "responses array is required");
      }

      const newResponses = await CheckInResponseService.createMultipleResponses(responses);
      httpResponse.created(res, newResponses, "Check-in responses created successfully");
    } catch (error) {
      next(error);
    }
  }

  static async updateCheckInResponse(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedResponse = await CheckInResponseService.updateCheckInResponse(id, updateData);
      httpResponse.success(res, updatedResponse, 200, "Check-in response updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async deleteCheckInResponse(req, res, next) {
    try {
      const { id } = req.params;
      const deletedResponse = await CheckInResponseService.deleteCheckInResponse(id);
      httpResponse.success(res, deletedResponse, 200, "Check-in response deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}
