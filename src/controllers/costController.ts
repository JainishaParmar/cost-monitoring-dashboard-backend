import { Op, fn, col } from 'sequelize';
import { Request, Response, NextFunction } from 'express';
import CostRecord from '../models/CostRecord';
import {
  FilterQuery,
  CostSummaryItem,
  CostTrendItem,
  AvailableFilters,
  ApiResponse,
  PaginatedResponse,
  CostRecordCreationAttributes,
} from '../types';
import { log } from '../utils/logger';
import { NotFoundError, DatabaseError } from '../utils/errors';

/**
 * Cost Controller
 * Handles all cost-related API operations including CRUD, filtering, and analytics
 */
const costController = {
  /**
   * GET /api/costs
   * Get all cost records with pagination and filtering
   * Supports filtering by date range, service, region, and account
   */
  async getCostRecords(req: Request<object, object, object, FilterQuery>, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        page = '1',
        limit = '50',
        startDate,
        endDate,
        serviceName,
        region,
        accountId,
      } = req.query;

      const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
      const whereClause: Record<string, unknown> = {};

      // Build date filter
      if (startDate && endDate) {
        whereClause['date'] = {
          [Op.between]: [startDate, endDate],
        };
      } else if (startDate) {
        whereClause['date'] = {
          [Op.gte]: startDate,
        };
      } else if (endDate) {
        whereClause['date'] = {
          [Op.lte]: endDate,
        };
      }

      // Add service filter - support multiple values
      if (serviceName) {
        if (Array.isArray(serviceName)) {
          whereClause['serviceName'] = {
            [Op.in]: serviceName,
          };
        } else {
          whereClause['serviceName'] = serviceName;
        }
      }

      // Add region filter - support multiple values
      if (region) {
        if (Array.isArray(region)) {
          whereClause['region'] = {
            [Op.in]: region,
          };
        } else {
          whereClause['region'] = region;
        }
      }

      // Add account filter - support multiple values
      if (accountId) {
        if (Array.isArray(accountId)) {
          whereClause['accountId'] = {
            [Op.in]: accountId,
          };
        } else {
          whereClause['accountId'] = accountId;
        }
      }

      const { count, rows } = await CostRecord.findAndCountAll({
        where: whereClause,
        order: [['date', 'DESC']],
        limit: parseInt(limit, 10),
        offset,
      });

      const response: PaginatedResponse<CostRecord> = {
        success: true,
        data: rows,
        pagination: {
          currentPage: parseInt(page, 10),
          totalPages: Math.ceil(count / parseInt(limit, 10)),
          totalRecords: count,
          recordsPerPage: parseInt(limit, 10),
        },
      };

      log.info('Cost records fetched successfully', {
        count: rows.length,
        totalRecords: count,
        filters: {
          startDate, endDate, serviceName, region, accountId,
        },
      });

      res.json(response);
    } catch (error) {
      log.error('Error fetching cost records', {
        error: error instanceof Error ? error.message : 'Unknown error',
        filters: req.query,
      });
      return next(new DatabaseError('Failed to fetch cost records'));
    }
  },

  /**
   * GET /api/costs/summary
   * Get cost summary aggregated by service
   * Returns total cost and record count per service
   */
  async getCostSummaryByService(req: Request<object, object, object, FilterQuery>, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        startDate, endDate, region, accountId, serviceName,
      } = req.query;
      const whereClause: Record<string, unknown> = {};

      if (startDate && endDate) {
        whereClause['date'] = {
          [Op.between]: [startDate, endDate],
        };
      }

      // Add region filter - support multiple values
      if (region) {
        if (Array.isArray(region)) {
          whereClause['region'] = {
            [Op.in]: region,
          };
        } else {
          whereClause['region'] = region;
        }
      }

      // Add account filter - support multiple values
      if (accountId) {
        if (Array.isArray(accountId)) {
          whereClause['accountId'] = {
            [Op.in]: accountId,
          };
        } else {
          whereClause['accountId'] = accountId;
        }
      }

      // Add service filter - support multiple values
      if (serviceName) {
        if (Array.isArray(serviceName)) {
          whereClause['serviceName'] = {
            [Op.in]: serviceName,
          };
        } else {
          whereClause['serviceName'] = serviceName;
        }
      }

      const summary = await CostRecord.findAll({
        where: whereClause,
        attributes: [
          'serviceName',
          [fn('SUM', col('cost_amount')), 'totalCost'],
          [fn('COUNT', col('id')), 'recordCount'],
        ],
        group: ['serviceName'],
        order: [[fn('SUM', col('cost_amount')), 'DESC']],
      });

      const formattedSummary: CostSummaryItem[] = summary.map((item) => {
        const dataValues = item.dataValues as unknown as Record<string, unknown>;
        return {
          serviceName: dataValues['serviceName'] as string,
          totalCost: parseFloat(dataValues['totalCost'] as string || '0'),
          recordCount: parseInt(dataValues['recordCount'] as string || '0', 10),
        };
      });

      const response: ApiResponse<CostSummaryItem[]> = {
        success: true,
        data: formattedSummary,
      };

      log.info('Cost summary fetched successfully', {
        summaryCount: formattedSummary.length,
        filters: {
          startDate, endDate, region, accountId, serviceName,
        },
      });

      res.json(response);
    } catch (error) {
      log.error('Error fetching cost summary', {
        error: error instanceof Error ? error.message : 'Unknown error',
        filters: req.query,
      });
      return next(new DatabaseError('Failed to fetch cost summary'));
    }
  },

  /**
   * GET /api/costs/trends
   * Get cost trends over time (daily aggregation)
   * Returns daily cost totals for trend analysis
   */
  async getCostTrends(req: Request<object, object, object, FilterQuery>, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        startDate, endDate, serviceName, region, accountId,
      } = req.query;
      const whereClause: Record<string, unknown> = {};

      if (startDate && endDate) {
        whereClause['date'] = {
          [Op.between]: [startDate, endDate],
        };
      }

      // Add service filter - support multiple values
      if (serviceName) {
        if (Array.isArray(serviceName)) {
          whereClause['serviceName'] = {
            [Op.in]: serviceName,
          };
        } else {
          whereClause['serviceName'] = serviceName;
        }
      }

      // Add region filter - support multiple values
      if (region) {
        if (Array.isArray(region)) {
          whereClause['region'] = {
            [Op.in]: region,
          };
        } else {
          whereClause['region'] = region;
        }
      }

      // Add account filter - support multiple values
      if (accountId) {
        if (Array.isArray(accountId)) {
          whereClause['accountId'] = {
            [Op.in]: accountId,
          };
        } else {
          whereClause['accountId'] = accountId;
        }
      }

      const trends = await CostRecord.findAll({
        where: whereClause,
        attributes: [
          'date',
          [fn('SUM', col('cost_amount')), 'dailyCost'],
        ],
        group: ['date'],
        order: [['date', 'ASC']],
      });

      const formattedTrends: CostTrendItem[] = trends.map((item) => {
        const dataValues = item.dataValues as unknown as Record<string, unknown>;
        return {
          date: new Date(dataValues['date'] as string),
          dailyCost: parseFloat(dataValues['dailyCost'] as string || '0'),
        };
      });

      const response: ApiResponse<CostTrendItem[]> = {
        success: true,
        data: formattedTrends,
      };

      log.info('Cost trends fetched successfully', {
        trendsCount: formattedTrends.length,
        filters: {
          startDate, endDate, serviceName, region, accountId,
        },
      });

      res.json(response);
    } catch (error) {
      log.error('Error fetching cost trends', {
        error: error instanceof Error ? error.message : 'Unknown error',
        filters: req.query,
      });
      return next(new DatabaseError('Failed to fetch cost trends'));
    }
  },

  /**
   * GET /api/costs/filters
   * Get available filter options for the frontend
   * Returns distinct values for services, regions, and accounts
   */
  async getAvailableFilters(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [services, regions, accounts] = await Promise.all([
        CostRecord.findAll({
          attributes: [[fn('DISTINCT', col('service_name')), 'serviceName']],
          raw: true,
        }),
        CostRecord.findAll({
          attributes: [[fn('DISTINCT', col('region')), 'region']],
          raw: true,
        }),
        CostRecord.findAll({
          attributes: [[fn('DISTINCT', col('account_id')), 'accountId']],
          raw: true,
        }),
      ]);

      const filters: AvailableFilters = {
        services: services.map((item) => item.serviceName as string),
        regions: regions.map((item) => item.region as string),
        accounts: accounts.map((item) => item.accountId as string),
      };

      const response: ApiResponse<AvailableFilters> = {
        success: true,
        data: filters,
      };

      log.info('Available filters fetched successfully', {
        servicesCount: filters.services.length,
        regionsCount: filters.regions.length,
        accountsCount: filters.accounts.length,
      });

      res.json(response);
    } catch (error) {
      log.error('Error fetching available filters', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return next(new DatabaseError('Failed to fetch available filters'));
    }
  },

  /**
   * POST /api/costs
   * Create a new cost record
   * Validates required fields and creates the record
   */
  async createCostRecord(req: Request<object, object, CostRecordCreationAttributes>, res: Response, next: NextFunction): Promise<void> {
    try {
      const costRecord = await CostRecord.create(req.body);

      const response: ApiResponse<CostRecord> = {
        success: true,
        data: costRecord,
        message: 'Cost record created successfully',
      };

      log.info('Cost record created successfully', {
        recordId: costRecord.id,
        serviceName: costRecord.serviceName,
        costAmount: costRecord.costAmount,
      });

      res.status(201).json(response);
    } catch (error) {
      log.error('Error creating cost record', {
        error: error instanceof Error ? error.message : 'Unknown error',
        data: req.body,
      });
      return next(new DatabaseError('Failed to create cost record'));
    }
  },

  /**
   * PUT /api/costs/:id
   * Update an existing cost record
   * Validates the record exists before updating
   */
  async updateCostRecord(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const costRecord = await CostRecord.findByPk(id);

      if (!costRecord) {
        return next(new NotFoundError('Cost record not found'));
      }

      await costRecord.update(req.body);

      log.info('Cost record updated successfully', {
        recordId: costRecord.id,
        serviceName: costRecord.serviceName,
      });

      const response: ApiResponse<CostRecord> = {
        success: true,
        data: costRecord,
        message: 'Cost record updated successfully',
      };

      res.json(response);
    } catch (error) {
      log.error('Error updating cost record', {
        error: error instanceof Error ? error.message : 'Unknown error',
        recordId: req.params.id,
        data: req.body,
      });
      return next(new DatabaseError('Failed to update cost record'));
    }
  },

  /**
   * DELETE /api/costs/:id
   * Delete a cost record
   * Validates the record exists before deletion
   */
  async deleteCostRecord(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const costRecord = await CostRecord.findByPk(id);

      if (!costRecord) {
        return next(new NotFoundError('Cost record not found'));
      }

      await costRecord.destroy();

      log.info('Cost record deleted successfully', {
        recordId: costRecord.id,
        serviceName: costRecord.serviceName,
      });

      const response: ApiResponse = {
        success: true,
        message: 'Cost record deleted successfully',
      };

      res.json(response);
    } catch (error) {
      log.error('Error deleting cost record', {
        error: error instanceof Error ? error.message : 'Unknown error',
        recordId: req.params.id,
      });
      return next(new DatabaseError('Failed to delete cost record'));
    }
  },
};

export default costController;
