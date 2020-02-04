import { Router, Request, Response, NextFunction } from 'express';
import { Logger } from '@overnightjs/logger';
import { createChatMessage } from '../../../../controllers/SWING_Chat/index';

const logger = new Logger();
const router: any = Router();

router.post(
  '/CreateMsg',
  async (req: Request, res: Response, next: NextFunction) => {
    const { senderId, recipientsId, video, picture, text } = req.body;
    // @ts-ignore
    req.io.sockets.emit('message', 'HELLOOO!!');
    res.status(200).send('createMsg working')
    console.log('working createMsg');
  },
);

export const createMsg = router;
