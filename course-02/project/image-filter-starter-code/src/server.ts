import express from 'express';
import bodyParser from 'body-parser';
import { sequelize } from './sequelize';

import { IndexRouter } from './v0/index.router';
import { isNumber } from './util/util';

// Definitions of the table User
import { V0MODELS } from './v0/model.index';

(async () => {

  var port:number = 8082;
  
  if(isNumber(process.env.PORT.toString()))
  {
    port = parseInt(process.env.PORT);
  }

  const app = express();

  //CORS Should be restricted
  app.use(function (req, res, next) {
    res.header(`Access-Control-Allow-Origin", "http://localhost:${port}`);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
  });

  await sequelize.addModels(V0MODELS);

  // Do not drop content of tables force:false
  await sequelize.sync({force:false})
  .then(() => {
      return console.log(`Connection established to database ${process.env.POSTGRESS_HOST}.`);
  })
  .catch((error:any)=>{
      return console.error(error);
  });
  
  app.use(bodyParser.json());

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