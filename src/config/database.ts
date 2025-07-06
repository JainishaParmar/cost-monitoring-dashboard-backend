import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Function to resolve environment variables or use config values
const resolveConfig = (key: string, defaultValue?: string) => {
  const envValue = process.env[key];
  if (envValue) return envValue;
  return defaultValue;
};

const sequelize = new Sequelize(
  resolveConfig('DB_NAME', 'cost_monitoring_db')!,
  resolveConfig('DB_USER', 'postgres')!,
  resolveConfig('DB_PASSWORD', 'postgres')!,
  {
    host: resolveConfig('DB_HOST', 'localhost')!,
    port: parseInt(resolveConfig('DB_PORT', '5432')!, 10),
    dialect: 'postgres',
    logging: process.env['NODE_ENV'] === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
    },
  },
);

export default sequelize;
