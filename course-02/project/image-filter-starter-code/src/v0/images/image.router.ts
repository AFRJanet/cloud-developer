import { Router, Request, Response } from 'express';
import { filterImageFromURL, deleteLocalFiles } from './../../util/util';
import fs, { readFile } from 'fs';

import { requireAuthentification } from '../users/routes/auth.router';
import * as AWS from './../../aws';

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

//! END @TODO1
//   ../filteredimage?image_url=requested_url"
router.get("/filteredimage/",
   requireAuthentification,
   async (req: Request, res: Response, next) => {

      var image_url = req.query.image_url;

      if (!image_url)
         return res.status(400).send(`Please provide an url for image_url.`);

      var filtered = filterImageFromURL(image_url.toString());

      if (!filtered)
         return res.status(401).send(`The image_url: ${image_url} seems to not contain an image.`);


      var file_path = (await filtered).toString();
      return res.sendFile(file_path, "", function (error) {
         if (error) {
            res.status(400).send(`Could not send file: ${filtered} and the error is: ${error}`);
         } else {
            deleteLocalFiles([file_path]);
         }
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
