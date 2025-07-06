import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { CostRecordAttributes, CostRecordCreationAttributes } from '../types';

/**
 * CostRecord Model
 * Represents AWS cost records with service details, amounts, and metadata
 */
class CostRecord extends Model<CostRecordAttributes, CostRecordCreationAttributes> implements CostRecordAttributes {
  public id!: number;

  public date!: Date;

  public serviceName!: string;

  public costAmount!: number;

  public region!: string;

  public accountId!: string;

  public resourceId?: string;

  public usageType?: string;

  public description?: string;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;
}

CostRecord.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Date of the cost record',
    },
    serviceName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'service_name',
      comment: 'AWS service name (EC2, S3, Lambda, RDS, etc.)',
    },
    costAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'cost_amount',
      comment: 'Cost amount in USD',
    },
    region: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'AWS region (us-east-1, us-west-2, etc.)',
    },
    accountId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'account_id',
      comment: 'AWS account ID',
    },
    resourceId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'resource_id',
      comment: 'AWS resource identifier',
    },
    usageType: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'usage_type',
      comment: 'Type of usage (e.g., BoxUsage, DataTransfer)',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Additional description of the cost',
    },
  },
  {
    sequelize,
    tableName: 'cost_records',
    indexes: [
      {
        fields: ['date'],
      },
      {
        fields: ['service_name'],
      },
      {
        fields: ['region'],
      },
      {
        fields: ['account_id'],
      },
    ],
  },
);

export default CostRecord;
