import { Router, Request, Response } from 'express';

import { User } from '../models/User';

import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { NextFunction } from 'connect';

import * as EmailValidator from 'email-validator';
import { config } from '../../../config/config';
import { ReadStream } from 'fs';

const router: Router = Router();

const saltRounds = 10;

async function generatePassword(plainTextPassword: string): Promise<string> {
   const salt = await bcrypt.genSalt(saltRounds);
   const hash = await bcrypt.hash(plainTextPassword, salt);

   return hash;
}

async function comparePasswords(plainTextPassword: string, hash: string): Promise<boolean> {
   return await bcrypt.compare(plainTextPassword, hash);
}

function generateJWT(user: User): string {
   return jwt.sign(user.toJSON(), config.jwt.secret);
}


//****************************************************************
//                 EXPORTS
//****************************************************************
export function requireAuthentification(req: Request, res: Response, next: NextFunction) {
   if (!req.headers || !req.headers.authorization) {
      return res.status(401).send({ message: 'No authorization headers.' });
   }


   const token_bearer = req.headers.authorization.split(' ');
   if (token_bearer.length != 2) {
      return res.status(401).send({ message: 'Malformed token.' });
   }

   const token = token_bearer[1];

   return jwt.verify(token, config.jwt.secret, (err, decoded) => {
      if (err) {
         return res.status(500).send({ auth: false, message: 'Failed to authenticate.' });
      }
      return next();
   });
}

router.post('/register',
   async (req: Request, res: Response) => {
      const username = req.body.username;
      const email = req.body.email;
      const password = req.body.password;

      if (!username)
         return res.status(400).send('Please provide username.');

      if (!email)
         return res.status(400).send('Please provide email address.');

      if (!password)
         return res.status(400).send('Please provide password.');

      const hash = await generatePassword(password);

      console.log('This is the generated password hash included with salt', hash);

      await User.create({ email: email, user_name: username, password_hash: hash })
         .then(function (user) {
            console.log('successful: ', user.toJSON());
         })
         .catch(function (err) {
            console.log(err, req.body.email);
            return res.status(400).send(`The new User could not get registered with email ${req.body.email}.`);
         });

      return res.status(200).send(`The User ${username} is registered with the email: ${email}.`);
   })


router.get('/verify',
   requireAuthentification,
   async (req: Request, res: Response) => {
      return res.status(200).send({ auth: true, message: 'Authenticated.' });
   });


router.post('/login', async (req: Request, res: Response) => {
   const email = req.body.email;
   const password = req.body.password;
   // check email is valid
   if (!email || !EmailValidator.validate(email)) {
      return res.status(400).send({ auth: false, message: 'Email is required or malformed' });
   }

   // check email password valid
   if (!password) {
      return res.status(400).send({ auth: false, message: 'Password is required' });
   }

   const user = await User.findByPk(email);
   // check that user exists
   if (!user) {
      return res.status(404).send({ auth: false, message: 'User was not found.' });
   }

   // check that the password matches
   const authValid = await comparePasswords(password, user.password_hash)

   if (!authValid) {
      return res.status(401).send({ auth: false, message: 'Unauthorized' });
   }

   // Generate JWT
   const jwt = generateJWT(user);

   res.status(200).send({ auth: true, token: jwt, user: user.short() });
   // added return
   return;
});

export const AuthRouter: Router = router;