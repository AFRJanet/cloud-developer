import express from 'express';
import bodyParser from 'body-parser';
import { sequelize } from './sequelize';

import { IndexRouter } from './v0/index.router';

// Definitions of the table User
import { V0MODELS } from './v0/model.index';

// var debug = require('debug')

(async () => {

  await sequelize.addModels(V0MODELS);

  // Do not drop content of tables force:false

  // await sequelize.sync({force:false})
  await sequelize.sync({logging:console.log, force:false})
  .then(() => {
      return console.log(`Connection established to database ${process.env.POSTGRESS_HOST}.`);
  })
  .catch((error:any)=>{
      return console.error(error);
  });

  //------------------------------->
  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // console.log(`Port of udagram-janetschek-dev-dev is: ${port}`);
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  //CORS Should be restricted
  app.use(function(req, res, next) {
    // res.setHeader('WWW-Authenticate', 'Bearer');
    // res.header(`Access-Control-Allow-Origin", "http://localhost:${port}`);
    // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

  //CORS Should be restricted
    res.header(`Access-Control-Allow-Origin", "http://localhost:${port}`);
    // res.header("Access-Control-Allow-Origin", "http://localhost:8080");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
  });

  // IndexRouter uses
  // - ImageRouter
  // - UserRouter
  app.use('/api/v0/', IndexRouter)

  // Root URI call
  app.get( "/", async ( req, res ) => {
    res.send( "/api/v0/" );
  } );

  // Start the Server
  app.listen( port, () => {
      console.log( `Local server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();