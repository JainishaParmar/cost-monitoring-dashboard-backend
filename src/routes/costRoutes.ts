import { Router } from 'express';
import costController from '../controllers/costController';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

/**
 * Cost Routes
 * All cost-related API endpoints with proper documentation
 */

// GET /api/costs - Get all cost records with filtering and pagination
router.get('/', asyncHandler(costController.getCostRecords));

// GET /api/costs/summary - Get cost summary aggregated by service
router.get('/summary', asyncHandler(costController.getCostSummaryByService));

// GET /api/costs/trends - Get cost trends over time (daily aggregation)
router.get('/trends', asyncHandler(costController.getCostTrends));

// GET /api/costs/filters - Get available filter options for frontend
router.get('/filters', asyncHandler(costController.getAvailableFilters));

// POST /api/costs - Create a new cost record
router.post('/', asyncHandler(costController.createCostRecord));

// PUT /api/costs/:id - Update an existing cost record
router.put('/:id', asyncHandler(costController.updateCostRecord));

// DELETE /api/costs/:id - Delete a cost record
router.delete('/:id', asyncHandler(costController.deleteCostRecord));

export default router;
