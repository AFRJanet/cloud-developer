import { Router, Request, Response } from 'express';
import { filterImageFromURL, deleteLocalFiles } from './../../util/util';
import fs, { readFile } from 'fs';

import { requireAuthentification } from '../users/routes/auth.router';
import * as AWS from './../../aws';

var debug = require('debug')

const router: Router = Router();

// Root Endpoint
// Displays a simple message to the user

//  res.send("try GET /filteredimage?image_url={{}}")
router.get("/", async (req: Request, res: Response) => {
   res.status(200).send(`Provide an image_url like /filterimage?image_url=`);
});

// @TODO1 IMPLEMENT A RESTFUL ENDPOINT
// GET /filteredimage?image_url={{URL}}
// endpoint to filter an image from a public url.
// IT SHOULD
//    1
//    1. validate the image_url query
//    2. call filterImageFromURL(image_url) to filter the image
//    3. send the resulting file in the response
//    4. deletes any files on the server on finish of the response
// QUERY PARAMATERS
//    image_url: URL of a publicly accessible image
// RETURNS
//   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

/**************************************************************************** */

// //! END @TODO1
// //   ../filteredimage?image_url=requested_url"
router.get("/filteredimage/",
   // requireAuthentification
   async (req: Request, res: Response, next) => {

      const query = req.query;

      if(typeof query.image_url !== "string")
         return res.status(422).send(`The image url must be a string!`);

      const image_url:string = query.image_url;

      if (!image_url)
         return res.status(406).send(`Please provide an url for image_url.`);

      debug(`ImageUrl will be filtered now: ${image_url}`);
      filterImageFromURL(image_url).catch( error => {
         return res.status(400).send(`Could not filter image from url: ${image_url}`);
      }).then(file_path => {

         if(typeof file_path !== "string")
            return res.status(422).send(`File Path is not a valid string`);
         
            return res.on('finish', () => {
               var letters: string[] = [file_path.toString()]
               deleteLocalFiles(letters);
           }).status(200).sendFile(file_path.toString());
      });
   });


// Get a signed url to put a new item in the bucket
router.get('/signed-url/:fileName',
   requireAuthentification,
   async (req: Request, res: Response) => {
      let { fileName } = req.params;
      // console.log(`FileName: ${fileName}.`);
      // const url = AWS.getGetSignedUrl(fileName);
      const url = AWS.getPutSignedUrl(fileName);
      // const url = AWS.getGetSignedUrl(fileName);
      res.status(201).send({ url: url });
   });

export const ImageRouter: Router = router;
