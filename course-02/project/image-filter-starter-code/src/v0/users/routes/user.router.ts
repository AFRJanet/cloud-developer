import { Router, Request, Response } from 'express';

import { User } from '../models/User';
import { AuthRouter, requireAuthentification } from './auth.router';

const router: Router = Router();

// Router uses the following:
//
// auth.router.get('api/v0/users/auth/verify')
// auth.router.post('api/v0/users/auth/login')
router.use('/auth', AuthRouter);

router.get(':id', async (req: Request, res: Response) => {
   let {id} = req.params;
   const item = await User.findByPk(id);

   if(item){
      res.status(200).send(item);
   }

   return res.status(400).send('User does not exist');
});

export const UserRouter: Router = router;