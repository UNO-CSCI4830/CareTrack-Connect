import { httpResponse } from "../utils/httpResponse.js";
import { QuestionService } from "../services/questionService.js";

export class QuestionController {
  static async getAllQuestions(req, res, next) {
    try {
      const questions = await QuestionService.getAllQuestions();
      httpResponse.success(res, questions, 200, "Questions retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getActiveQuestions(req, res, next) {
    try {
      const questions = await QuestionService.getActiveQuestions();
      httpResponse.success(res, questions, 200, "Active questions retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getQuestionById(req, res, next) {
    try {
      const { id } = req.params;
      const question = await QuestionService.getQuestionById(id);
      
      if (!question) {
        return httpResponse.notFound(res, "Question not found");
      }

      httpResponse.success(res, question, 200, "Question retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getQuestionsByType(req, res, next) {
    try {
      const { questionType } = req.params;
      const questions = await QuestionService.getQuestionsByType(questionType);
      httpResponse.success(res, questions, 200, `Questions of type '${questionType}' retrieved successfully`);
    } catch (error) {
      next(error);
    }
  }

  static async createQuestion(req, res, next) {
    try {
      const questionData = req.body;
      
      if (!questionData.question_text || !questionData.question_type) {
        return httpResponse.badRequest(res, "question_text and question_type are required");
      }

      const newQuestion = await QuestionService.createQuestion(questionData);
      httpResponse.created(res, newQuestion, "Question created successfully");
    } catch (error) {
      next(error);
    }
  }

  static async updateQuestion(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedQuestion = await QuestionService.updateQuestion(id, updateData);
      httpResponse.success(res, updatedQuestion, 200, "Question updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async deleteQuestion(req, res, next) {
    try {
      const { id } = req.params;
      const deletedQuestion = await QuestionService.deleteQuestion(id);
      httpResponse.success(res, deletedQuestion, 200, "Question deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  static async deactivateQuestion(req, res, next) {
    try {
      const { id } = req.params;
      const deactivatedQuestion = await QuestionService.deactivateQuestion(id);
      httpResponse.success(res, deactivatedQuestion, 200, "Question deactivated successfully");
    } catch (error) {
      next(error);
    }
  }
}
