import { Router } from 'express';
import costController from '../controllers/costController';

const router = Router();

/**
 * Cost Routes
 * All cost-related API endpoints with proper documentation
 */

// GET /api/costs - Get all cost records with filtering and pagination
router.get('/', costController.getCostRecords);

// GET /api/costs/summary - Get cost summary aggregated by service
router.get('/summary', costController.getCostSummaryByService);

// GET /api/costs/trends - Get cost trends over time (daily aggregation)
router.get('/trends', costController.getCostTrends);

// GET /api/costs/filters - Get available filter options for frontend
router.get('/filters', costController.getAvailableFilters);

// POST /api/costs - Create a new cost record
router.post('/', costController.createCostRecord);

// PUT /api/costs/:id - Update an existing cost record
router.put('/:id', costController.updateCostRecord);

// DELETE /api/costs/:id - Delete a cost record
router.delete('/:id', costController.deleteCostRecord);

export default router;
