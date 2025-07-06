import { Request, Response, NextFunction } from 'express';
import { Model, Optional } from 'sequelize';

// Database Models
export interface CostRecordAttributes {
  id: number;
  date: Date;
  serviceName: string;
  costAmount: number;
  region: string;
  accountId: string;
  resourceId?: string;
  usageType?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CostRecordCreationAttributes extends Optional<
  CostRecordAttributes,
  'id' | 'createdAt' | 'updatedAt'
> {}

export interface CostRecordInstance extends Model<
  CostRecordAttributes,
  CostRecordCreationAttributes
>, CostRecordAttributes {}

// API Request/Response Types
export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface FilterQuery extends PaginationQuery {
  startDate?: string;
  endDate?: string;
  serviceName?: string;
  region?: string;
  accountId?: string;
}

export interface CostSummaryItem {
  serviceName: string;
  totalCost: number;
  recordCount: number;
}

export interface CostTrendItem {
  date: Date;
  dailyCost: number;
}

export interface AvailableFilters {
  services: string[];
  regions: string[];
  accounts: string[];
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  recordsPerPage: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: PaginationInfo;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationInfo;
}

// Express Types
export interface TypedRequest<T = unknown> extends Request {
  body: T;
}

export interface TypedResponse<T = unknown> extends Response {
  json: (body: ApiResponse<T>) => this;
}

export type RequestHandler<T = unknown> = (
  req: TypedRequest<T>,
  res: TypedResponse,
  next: NextFunction
) => Promise<void> | void;

// Error Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError extends Error {
  status?: number;
  errors?: ValidationError[];
}
