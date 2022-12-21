import { Router, Request, Response } from 'express';

import { User } from '../models/User';
import { AuthRouter, requireAuthentification } from './auth.router';

const router: Router = Router();

// Router uses the following:
//
// auth.router.get('api/v0/users/auth/verify')
// auth.router.post('api/v0/users/auth/login')
router.use('/auth', AuthRouter);

   router.get('/:email',
   requireAuthentification,
   async (req: Request, res: Response) => {
      // let { email } = req.params;
      let { email } = req.query;
      const user = await User.findByPk(email.toString());

      if (!user)
         return res.status(404).send(`User does not exist with email: ${email}`);

      return res.status(200).send(`User ${user.user_name} exist with email: ${user.email}.`);
   });

export const UserRouter: Router = router;