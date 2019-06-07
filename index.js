'use strict';

require('dotenv').config();
const mongoose = require('mongoose');

const mongooseOptions = {
  useNewUrlParser:true,
  useCreateIndex: true,
  useFindAndModify: false,
};

mongoose.connect(process.env.MONGODB_URI, mongooseOptions);

const QServer = require('@nmq/q/server');

QServer.start();

const files = new QServer('files');
files.monitorEvent('file-save');
files.monitorEvent('file-error');

const database = new QServer('database');

database.monitorEvent('create');
database.monitorEvent('read');
database.monitorEvent('update');
database.monitorEvent('delete');
database.monitorEvent('error');

require('./src/app.js').start(process.env.API_PORT || 8080);