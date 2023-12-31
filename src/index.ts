import 'dotenv/config';
import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import sequelize from './db.js';
import models from './models/models.js';
import router from './routers/index.js';
import errorHandlerMiddleware from './middlewares/errorHandlerMiddleware.js';
import fileUpload from 'express-fileupload';
import http from 'node:http';
import createWebSocketConnection from './ws/connection/webSocketConnection.js';

const PORT = process.env.PORT || 5000;

const app: Application = express();
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  }),
);
app.use(fileUpload({}));
app.use(cookieParser());
app.use(express.json());
app.use('/api', router);
app.use(errorHandlerMiddleware);

const server = http.createServer(app);

const start = async () => {
  try {
    console.log(models);
    await sequelize.authenticate();
    await sequelize.sync();
    createWebSocketConnection(server);
    server.listen(PORT, () => {
      console.log(`server is working on ${PORT}`);
    });
  } catch (err) {
    console.log(err);
  }
};

start();
