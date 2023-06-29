import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import sequelize from './db.js';
import dotenv from 'dotenv';
import models from './models/models.js';
import router from './routers/index.js';
import errorHandlerMiddleware from './middlewares/errorHandlerMiddleware.js';

dotenv.config();
const PORT = process.env.PORT || 5000;

const app: Application = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use('/api', router);
app.use(errorHandlerMiddleware);

const start = async () => {
  try {
    console.log(models);
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(PORT, () => {
      console.log(`server is working on ${PORT}`);
    });
  } catch (err) {
    console.log(err);
  }
};

start();
