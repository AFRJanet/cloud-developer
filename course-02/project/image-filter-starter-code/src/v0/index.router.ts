import { Router, Request, Response } from 'express';
import { appendFile } from 'fs';
import { UserRouter } from './users/routes/user.router';
import {ImageRouter} from './images/image.router';

const router: Router = Router();

router.use('/users', UserRouter);
router.use('/images', ImageRouter);

router.get('/', async (req: Request, res: Response) => {    
    res.send(`V0`);
});

export const IndexRouter: Router = router;