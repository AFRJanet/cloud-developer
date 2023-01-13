import { Sequelize } from 'sequelize-typescript';
import { config } from './config/config';

const c = config.prod;

// Instantiate new Sequelize instance!
const sequelizeConnection = new Sequelize({
  "username": c.username,
  "password": c.password,
  "database": c.database,
  "host": c.host,
  logging: false,
  dialect: 'postgres',
  storage: ':memory:',
});

export const sequelize: Sequelize = sequelizeConnection;