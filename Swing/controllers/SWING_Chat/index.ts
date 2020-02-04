import models from '../../models';
import { Logger } from '@overnightjs/logger';
import { GenericError } from '../../classes/profile';
import { ERRORS } from './objectError';
import { Op, Sequelize } from 'sequelize';
import chatRoom from '../../models/postgres/chatRoom';
import PartnerAccount from '../../models/postgres/partnerAccount';
import uuid = require('uuid');
const logger = new Logger();

export const createChatRoom = (): Promise<any> => {
  return models.chatRoom
    .create()
    .then((data: any) => {
      const result = data.get({ plain: true });
      console.log(result);
      return result;
    })
    .catch((err: any) => {
      logger.err('logger ' + err);
      throw new GenericError(ERRORS.DB_CHAT_ROOM_SAVE_ERROR);
    });
};

export const createpartnerACC = (): Promise<any> => {
  return (
    models.partnerAccount
      .create({ isVerified: true, isArchived: false, isPrivate: false })
      // .then((data) => logger.info(data))
      .then((data) => {
        const result = data.get({ plain: true });
        console.log(result);
        return result;
      })
      .catch((err) => {
        logger.err(err);
        throw new GenericError(ERRORS.DB_CHAT_ROOM_SAVE_ERROR);
      })
  );
};

// placing these two partner accounts to the created chat room
export const writeChatPartnerIds = (
  chatRoomUuid: string,
  partnerAccountId: string,
): Promise<any> => {
  return models.chatPartnerAccount
    .create({
      chatRoomUuid,
      partnerAccountId,
    })
    .then((data) => {
      const result = data.get({ plain: true });
      console.log(result);
      return result;
    })
    .catch((err) => {
      logger.err(err);
      throw new GenericError(ERRORS.DB_CHAT_PARTNER_ACCOUNT_SAVE_ERROR);
    });
};

export const createChatMessage = (
  chatRoomUuid: string,
  senderPartnerAccountId: number,
  video: string,
  picture: string,
  text: string,
): Promise<any> => {
  return models.chatMessage
    .create({ chatRoomUuid, senderPartnerAccountId, video, picture, text })
    .then((data) => {
      const result = data.get({ plain: true });
      console.log(result);
      return result;
    })
    .catch((err) => {
      logger.err(err);
      throw new GenericError(ERRORS.DB_CHAT_MESSAGE_SAVE_ERROR);
    });
};

export const messageIsReadStatus = (
  messageUuid: string,
  partnerAccountId: string,
  isRead: boolean,
): Promise<any> => {
  return models.messageIsReadStatus
    .create({ messageUuid, partnerAccountId, isRead })
    .then((data) => {
      const result = data.get({ plain: true });
      console.log(result);
      return result;
    })
    .catch((err) => {
      logger.err(err);
      throw new GenericError(ERRORS.DB_MESSAGE_IS_READ_STATUS_ERROR);
    });
};

export const checkIfPartnerAccountExist = async (
  partnerAccountId: number,
): Promise<any> => {
  return models.partnerAccount
    .findByPk(partnerAccountId, {
      raw: true,
    })
    .catch((err) => {
      logger.err(err);
      throw new GenericError(ERRORS.DB_PARTNER_ACCOUNT_ERROR);
    });
};

export const findAllChats = (partnerAccountId: number): Promise<any> => {
  // find all chatRooms of current partner account
  return (
    models.partnerAccount
      .findAll({
        attributes: ['id'],
        where: {
          id: partnerAccountId,
        },
        include: [
          {
            model: models.chatRoom,
            as: 'chatRoom',
            attributes: ['uuid'],
            through: {
              attributes: [],
            },
          },
        ],
      })
      // creating arr for next query
      .then((data: any) => {
        if (data.length === 0) {
          throw new GenericError(ERRORS.CHATS_NOT_FOUNDED_ERROR);
        };
        console.log(JSON.stringify(data, null, 2));
        const arr: string[] = [];
        data[0].chatRoom.forEach((e: any) => {
          arr.push(e.uuid);
        });
        console.log(arr);
        return arr;
      })
      .then((arr: string[]) => {
        // find all chats first message info of partner account including isArchived field = false
        return models.partnerAccount.findAll({
          attributes: ['id'],
          where: {
            id: partnerAccountId,
          },

          include: [
            {
              model: models.chatRoom,
              as: 'chatRoom',
              attributes: ['uuid'],
              through: {
                attributes: [],
              },
              include: [
                {
                  model: models.partnerAccount,
                  as: 'partnerAccount',
                  attributes: ['id'],
                  through: {
                    attributes: [],
                  },
                  where: {
                    isArchived: 'false',
                    id: {
                      [Op.ne]: partnerAccountId,
                    },
                  },
                  include: [
                    {
                      model: models.chatRoom,
                      as: 'chatRoom',
                      attributes: ['uuid'],
                      through: {
                        attributes: [],
                      },
                      where: {
                        uuid: {
                          [Op.or]: arr,
                        },
                      },
                      include: [
                        {
                          model: models.chatMessage,
                          as: 'chatMessage',
                          attributes: [
                            'text',
                            'video',
                            'picture',
                            'chatRoomUuid',
                            'createdAt',
                          ],
                          limit: 1,
                          order: [['createdAt', 'DESC']],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        });
      })
      // preparing the information
      .then((data: any) => {
        console.log(JSON.stringify(data, null, 2));
        const arr: Array<{
          text: string;
          video: string;
          picture: string;
          chatRoomUuid: string;
          createdAt: string;
        }> = [];
        data[0].chatRoom.forEach((e: any) => {
          arr.push(e.partnerAccount[0].chatRoom[0].chatMessage[0]);
        });
        console.log(JSON.stringify(arr, null, 2));
        return arr;
      })
      .catch((err) => {
        logger.err(err);
        throw new GenericError(ERRORS.CHATS_NOT_FOUNDED_ERROR);
      })
  );
};

// check if there any chat between this two partner accounts
export const checkIfChatExist = (
  partnerAccountId1: number,
  partnerAccountId2: number,
): Promise<any> => {
  return models.partnerAccount
    .findAll({
      where: {
        id: partnerAccountId1,
      },
      include: [
        {
          model: models.chatRoom,
          as: 'chatRoom',
          include: [
            {
              model: models.partnerAccount,
              as: 'partnerAccount',
              where: {
                id: partnerAccountId2,
              },
            },
          ],
        },
      ],
    })
    .then((data) => {
      console.log(JSON.stringify(data, null, 2));
      return data;
    })
    .catch((err) => {
      logger.err(err);
      throw new GenericError(ERRORS.DB_CHAT_MESSAGE_SAVE_ERROR);
    });
};
/*
SELECT pa.id, cpa.chat_room_uuid FROM public.partner_account AS pa
JOIN public.chat_partner_account AS cpa on cpa.partner_account_id=pa.id and pa.id=1
UNION
SELECT pa2.id, cpa2.chat_room_uuid FROM public.partner_account AS pa2
JOIN public.chat_partner_account AS cpa2 on cpa2.partner_account_id=pa2.id and cpa2.chat_room_uuid=cpa.chat_room_uuid;*/
