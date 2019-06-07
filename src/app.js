'use strict';

// 3rd Party Resources
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Esoteric Resources
const errorHandler = require( './middleware/error.js');
const notFound = require( './middleware/404.js' );

// QClient
const QClient = require('@nmq/q/client');

// Models
const Files = require('./models/files.js');
const files = new Files();

// Prepare the express app
const app = express();

// App Level MW
app.use(cors());
app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({extended:true}));

// Routes
app.get('/files', getFiles);
app.post('/files', postFiles);
app.get('/files/:id', getOneFile);
app.put('/files/:id', putFiles);
app.delete('/files/:id', deleteFiles);

// Catchalls
app.use(notFound);
app.use(errorHandler);

// ROUTE HANDLER FUNCTIONS
function getFiles(request,response,next) {
  // expects an array of object to be returned from the model
  files.get()
    .then( data => {
      QClient.publish('database', 'read', `Read all: ${data}`);
      response.status(200).send(data);
    })
    .catch( next );
}

function getOneFile(request,response,next) {
  // expects an array with the one matching record from the model
  files.get(request.params.id)
    .then( result => {
      QClient.publish('database', 'read' `Read One: ${result}`)
      response.status(200).json(result) 
    })
    .catch( next );
}

function postFiles(request,response,next) {
  // expects the record that was just added to the database
  files.post(request.body)
    .then( result => {
      QClient.publish('database', 'create', `Create: ${result}`);
      response.status(200).json(result) 
    })
    .catch( next );
}

function putFiles(request,response,next) {
  // expects the record that was just updated in the database
  files.put(request.params.id, request.body)
    .then( result => {
      QClient.publish('database', 'update', `Update: ${result}`)
      response.status(200).json(result) 
    })
    .catch( next );
}

function deleteFiles(request,response,next) {
  // Expects no return value (resource was deleted)
  files.delete(request.params.id)
    .then( result => {
      QClient.publish('database', 'delete', `Delete: ${result}`)
      response.status(200).json(result) 
    })
    .catch( next );
}

module.exports = {
  server: app,
  start: (port) => app.listen(port, () => console.log(`Server up on port ${port}`) ),
};
