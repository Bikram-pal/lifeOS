import { DashboardService } from '../services/dashboard.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getDashboardSummary = async (req, res, next) => {
  try {
    const summary = await DashboardService.getSummary(req.user._id);
    return sendSuccess(res, 200, 'Dashboard data retrieved successfully', summary);
  } catch (err) {
    next(err);
  }
};
