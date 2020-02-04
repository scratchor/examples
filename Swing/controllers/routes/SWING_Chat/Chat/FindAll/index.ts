import { NextFunction, Request, Response, Router } from 'express';
import { Logger } from '@overnightjs/logger';
import { findAllChats } from '../../../../controllers/SWING_Chat/index';

const logger = new Logger();
const router: any = Router();

// router.get('/chatAll', createChatRoom);
router.post(
  '/findAll',
  async (req: Request, res: Response, next: NextFunction) => {
    const { partnerAccountId } = req.body;
    try {
      const data = await findAllChats(partnerAccountId);
      if (data) {
        logger.info('Status 200, chats were successfully found');
        res.status(200).send({
          message: 'Status 200, chats were successfully founded',
          data,
        });
      }
    } catch (e) {
      next(e);
    }
  },
);

export const chatsAll = router;
