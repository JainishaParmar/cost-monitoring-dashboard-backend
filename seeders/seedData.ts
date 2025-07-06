import path from 'path';
import dotenv from 'dotenv';
import { fn, col } from 'sequelize';
import CostRecord from '../src/models/CostRecord';
import sequelize from '../src/config/database';
import { CostRecordCreationAttributes } from '../src/types';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

/**
 * Seeder Configuration
 * AWS service definitions with realistic cost patterns
 */
interface AwsService {
  name: string;
  baseCost: number;
  variance: number;
  frequency: string;
}

const awsServices: AwsService[] = [
  { name: 'EC2', baseCost: 0.50, variance: 0.3, frequency: 'daily' },
  { name: 'S3', baseCost: 0.023, variance: 0.1, frequency: 'daily' },
  { name: 'Lambda', baseCost: 0.20, variance: 0.8, frequency: 'daily' },
  { name: 'RDS', baseCost: 0.017, variance: 0.2, frequency: 'daily' },
  { name: 'CloudFront', baseCost: 0.085, variance: 0.4, frequency: 'daily' },
  { name: 'DynamoDB', baseCost: 0.25, variance: 0.5, frequency: 'daily' },
  { name: 'ElastiCache', baseCost: 0.022, variance: 0.3, frequency: 'daily' },
  { name: 'API Gateway', baseCost: 0.09, variance: 0.6, frequency: 'daily' },
  { name: 'ECS', baseCost: 0.044, variance: 0.4, frequency: 'daily' },
  { name: 'CloudWatch', baseCost: 0.30, variance: 0.2, frequency: 'daily' }
];

const regions: string[] = [
  'us-east-1',
  'us-west-2',
  'eu-west-1',
  'ap-southeast-1',
  'sa-east-1'
];

const accountIds: string[] = [
  '123456789012',
  '987654321098',
  '555555555555'
];

/**
 * Cost Generation Functions
 * Generate realistic cost data based on service patterns
 */
function generateCost(service: AwsService): number {
  const baseCost = service.baseCost;
  const variance = service.variance;
  const randomFactor = 0.5 + Math.random(); // 0.5 to 1.5
  const varianceFactor = 1 + (Math.random() - 0.5) * variance;
  
  return parseFloat((baseCost * randomFactor * varianceFactor).toFixed(4));
}

function generateDateRange(): Date[] {
  const dates: Date[] = [];
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }
  
  return dates;
}

/**
 * Data Generation
 * Create exactly 50 cost records with realistic patterns
 */
async function generateCostData(): Promise<CostRecordCreationAttributes[]> {
  const costRecords: CostRecordCreationAttributes[] = [];
  const dates = generateDateRange();
  
  console.log('📊 Generating exactly 50 cost records...');
  
  let recordCount = 0;
  const maxRecords = 50;
  
  const usageTypes: Record<string, string[]> = {
    'EC2': ['BoxUsage', 'DataTransfer', 'EBSOptimization'],
    'S3': ['StorageUsage', 'DataTransfer', 'Requests'],
    'Lambda': ['Requests', 'Duration', 'DataTransfer'],
    'RDS': ['InstanceUsage', 'StorageUsage', 'DataTransfer'],
    'CloudFront': ['DataTransfer', 'Requests'],
    'DynamoDB': ['ReadCapacityUnits', 'WriteCapacityUnits', 'StorageUsage'],
    'ElastiCache': ['NodeUsage', 'DataTransfer'],
    'API Gateway': ['Requests', 'DataTransfer'],
    'ECS': ['FargateUsage', 'DataTransfer'],
    'CloudWatch': ['Metrics', 'Logs', 'Alarms']
  };
  
  for (const date of dates) {
    for (const service of awsServices) {
      if (recordCount >= maxRecords) break;
      
      // Generate 1-2 records per service per day for variety
      const recordsPerDay = Math.floor(Math.random() * 2) + 1;
      
      for (let i = 0; i < recordsPerDay && recordCount < maxRecords; i++) {
        const costAmount = generateCost(service);
        const region = regions[Math.floor(Math.random() * regions.length)] || 'us-east-1';
        const accountId = accountIds[Math.floor(Math.random() * accountIds.length)] || '123456789012';
        
        const serviceUsageTypes = usageTypes[service.name] || ['Usage'];
        const usageType = serviceUsageTypes[Math.floor(Math.random() * serviceUsageTypes.length)] || 'Usage';
        
        costRecords.push({
          date: date,
          serviceName: service.name,
          costAmount: costAmount,
          region: region,
          accountId: accountId,
          resourceId: `${service.name.toLowerCase()}-${Math.random().toString(36).substr(2, 8)}`,
          usageType: usageType,
          description: `${service.name} ${usageType} usage in ${region}`
        });
        
        recordCount++;
      }
    }
    if (recordCount >= maxRecords) break;
  }
  
  return costRecords;
}

/**
 * Database Seeding
 * Main function to seed the database with sample data
 */
async function seedDatabase(): Promise<void> {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established.');
    
    // Sync models
    await sequelize.sync({ force: true });
    console.log('✅ Database models synchronized.');
    
    // Generate cost data
    const costRecords = await generateCostData();
    console.log(`📝 Generated ${costRecords.length} cost records.`);
    
    // Insert data in batches
    const batchSize = 50;
    for (let i = 0; i < costRecords.length; i += batchSize) {
      const batch = costRecords.slice(i, i + batchSize);
      await CostRecord.bulkCreate(batch);
      console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(costRecords.length / batchSize)}`);
    }
    
    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Total records inserted: ${costRecords.length}`);
    
    // Show statistics
    const totalCost = await CostRecord.sum('costAmount');
    const serviceCounts = await CostRecord.findAll({
      attributes: [
        'serviceName',
        [fn('COUNT', col('id')), 'recordCount'],
        [fn('SUM', col('cost_amount')), 'totalCost']
      ],
      group: ['serviceName'],
      order: [[fn('SUM', col('cost_amount')), 'DESC']]
    });
    
    console.log('\n📈 Cost Summary by Service:');
    serviceCounts.forEach(service => {
      const dataValues = service.dataValues as unknown as Record<string, unknown>;
      console.log(`  ${service['serviceName']}: $${Number(dataValues['totalCost']).toFixed(2)} (${dataValues['recordCount']} records)`);
    });
    
    console.log(`\n💰 Total Cost: $${Number(totalCost).toFixed(2)}`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

seedDatabase();