import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const { DB_PORT, DB_HOST, DB_PASSWORD, DB_USERNAME, DB_NAME } = process.env;

const sequelize = new Sequelize(DB_NAME as string, DB_USERNAME as string, DB_PASSWORD as string, {
  dialect: 'postgres',
  host: DB_HOST as string,
  port: Number(DB_PORT),
});

export default sequelize;
