export const ERRORS = {
  EMAIL_ALREADY_IN_USE: {
    statusCode: 401,
    code: 'EMAIL_ALREADY_IN_USE',
    message: 'This email is already in use',
  },
  DB_SAVE_ERROR: {
    statusCode: 400,
    code: 'DB_SAVE_ERROR',
    message: 'Error save user in DB',
  },
  DB_CHAT_ROOM_SAVE_ERROR: {
    statusCode: 400,
    code: 'DB_CHAT_ROOM_SAVE_ERROR',
    message: 'Error create a chat in chatRoom database',
  },
  DB_CHAT_PARTNER_ACCOUNT_SAVE_ERROR: {
    statusCode: 400,
    code: 'DB_CHAT_PARTNER_ACCOUNT_SAVE_ERROR',
    message: 'Error write ids in chatPartnerAccount database',
  },
  DB_PARTNER_ACCOUNT_ERROR: {
    statusCode: 400,
    code: 'DB_PARTNER_ACCOUNT_ERROR',
    message: 'Error in chatPartnerAccount database',
  },
  CHATS_NOT_FOUNDED_ERROR: {
    statusCode: 400,
    code: 'CHATS_NOT_FOUNDED_ERROR',
    message: 'Chats were not founded',
  },
  DB_CHAT_PARTNER_ACCOUNT_ERROR: {
    statusCode: 400,
    code: 'DB_CHAT_PARTNER_ACCOUNT_ERROR',
    message: 'Error in chatPartnerAccount database',
  },
  DB_CHAT_MESSAGE_SAVE_ERROR: {
    statusCode: 400,
    code: 'DB_CHAT_MESSAGE_SAVE_ERROR',
    message: 'Error create a message in chatMessage database',
  },
  DB_MESSAGE_IS_READ_STATUS_ERROR: {
    statusCode: 400,
    code: 'DB_MESSAGE_IS_READ_STATUS_ERROR',
    message: 'Error create a message status in messageIsReadStatus database',
  },
  CHAT_IS_ALREADY_CREATED: {
    statusCode: 409,
    code: 'CHAT_IS_ALREADY_CREATED',
    message: 'Unable to create chat, it has been already created',
  },
  PARTNER_ACCOUNT_NOT_FOUND: {
    statusCode: 409,
    code: 'PARTNER_ACCOUNT_NOT_FOUND',
    message: `One or more PartnerAccounts not found`,
  },
  CHATS_FIND_ALL_ERROR: {
    statusCode: 501,
    code: 'CHATS_FIND_ALL_ERROR',
    message: `Error in findAll chats route`,
  },
  SERVER_ERROR: {
    statusCode: 500,
    code: 'SERVER_ERROR',
    message: 'Internal server error while /post',
  },
  JOI_VALIDATION_ERROR: {
    statusCode: 401,
    code: 'JOI_VALIDATION_ERROR',
    message: 'User entered invalid data or passwords does not match',
  },
  USER_NOT_FOUND: {
    statusCode: 404,
    code: 'USER_NOT_FOUND',
    message: 'Such number does not exist in DB',
  },
  USER_ALREADY_EXIST: {
    statusCode: 401,
    code: 'USER_ALREADY_EXIST:',
    message: 'Such user is already exist in DB',
  },
};
