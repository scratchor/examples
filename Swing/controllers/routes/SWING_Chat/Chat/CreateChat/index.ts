import { NextFunction, Request, Response, Router } from 'express';
import { Logger } from '@overnightjs/logger';
import {
  checkIfChatExist,
  createChatRoom,
  writeChatPartnerIds,
} from '../../../../controllers/SWING_Chat/index';
import { GenericError } from '../../../../classes/profile';
import { ERRORS } from '../../../../controllers/SWING_Chat/objectError';

const logger = new Logger();
const router: any = Router();

// first working variant

/*router.post(

  '/createChat',
  async (req: Request, res: Response, next: NextFunction) => {
    const { senderId, recipientId, video, picture, text } = req.body;
    try {
      // tslint:disable-next-line:no-shadowed-variable
      const chatRoom = await createChatRoom();
      const chatRoomUuid = chatRoom.uuid;
      console.log(
        'sender ' +
          senderId +
          '; ' +
          'recipient ' +
          recipientId +
          '; ' +
          'video ' +
          video +
          '; ' +
          'picture ' +
          picture +
          '; ' +
          'text ' +
          text +
          ';',
      );
      const data = await Promise.all([
        writeChatParnterIds(chatRoomUuid, senderId),
        writeChatParnterIds(chatRoomUuid, recipientId),
        createChatMessage(chatRoomUuid, senderId, video, picture, text),
      ]);
      const messageUuid = data[2].uuid;
      await Promise.all([
        messageIsReadStatus(messageUuid, senderId, false),
        messageIsReadStatus(messageUuid, recipientId, false),
      ]);
      logger.info('Status 200, chat request works fine');
      res.status(200).send('Status 200, chat was successfully created');
    } catch (e) {
      next(e);
    }
  },
);*/

// working variant
/*
router.post(
  '/createChat',
  async (req: Request, res: Response, next: NextFunction) => {
    const { senderId, recipientId } = req.body;
    try {
      // check if chat already exist & partnerAccount exist
      await Promise.all([
        checkIfChatExist(senderId),
        checkIfChatExist(recipientId),
        checkIfPartnerAccountExist(senderId),
        checkIfPartnerAccountExist(recipientId),
      ]).then((data) => {
        console.log(data);
        const result = data[0].some((item0: any) => {
          return data[1].some((item1: any) => {
            return item1.chatRoomUuid === item0.chatRoomUuid;
          });
        });
        // check if chat already exist
        if (result) {
          throw new GenericError(ERRORS.CHAT_IS_ALREADY_CREATED);
        }
        // check if partnerAccount exist
        if (data[2] === null || data[3] === null) {
          throw new GenericError(ERRORS.PARTNER_ACCOUNT_NOT_FOUND);
        }
      });
      // End check
      /!*      createChatMessage(
        'ef25eba0-9f8f-4f91-b7f8-a2c0aa1f0d06',
        senderId,
        '',
        '',
        'Hello Man!',
      );*!/
      const chatRoom = await createChatRoom();
      const chatRoomUuid = chatRoom.uuid;
      await Promise.all([
        writeChatPartnerIds(chatRoomUuid, senderId),
        writeChatPartnerIds(chatRoomUuid, recipientId),
      ]);
      logger.info('Сhat was successfully created');
      res.status(200).send({
        message: 'Status 2000, chat was successfully created',
        chatId: chatRoomUuid,
      });
    } catch (e) {
      next(e);
    }
  },
);
*/

router.post(
  '/createChat',
  async (req: Request, res: Response, next: NextFunction) => {
    const { partnerAccountId1, partnerAccountId2 } = req.body;
    try {
      // check if there any chat between this two partner accounts
      const data = await checkIfChatExist(partnerAccountId1, partnerAccountId2);
      if (data[0].chatRoom.length !== 0) {
        return next(new GenericError(ERRORS.CHAT_IS_ALREADY_CREATED));
      }
      // create new chat room
      const chatRoom = await createChatRoom();
      const chatRoomUuid = chatRoom.uuid;
      // placing these two partner accounts to the created chat room
      await Promise.all([
        writeChatPartnerIds(chatRoomUuid, partnerAccountId1),
        writeChatPartnerIds(chatRoomUuid, partnerAccountId2),
      ]);
      logger.info('Сhat was successfully created');
      res.status(200).send({
        message: 'Status 200, chat was successfully created',
        chatRoomUuid,
      });
    } catch (e) {
      next(e);
    }
  },
);

export const createChat = router;
