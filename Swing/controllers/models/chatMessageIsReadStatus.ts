import { DataTypes, Model, BuildOptions, Sequelize } from 'sequelize';
import { SequelizeAttributes } from '../index';
import chatMessage from './chatMessage';
import partnerAccount from './partnerAccount';

interface IMessageIsReadStatusAttributes {
  id: number;
  messageUuid: number;
  partnerAccountId: number;
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

type MessageIsReadStatic = typeof Model &
  (new (
    values?: object,
    options?: BuildOptions,
  ) => IMessageIsReadStatusAttributes);

export default (sequelize: Sequelize) => {
  const attributes: SequelizeAttributes<
    keyof IMessageIsReadStatusAttributes
  > = {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    messageUuid: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'message_uuid',
      references: {
        model: chatMessage(sequelize),
        key: 'uuid',
      },
    },
    partnerAccountId: {
      type: DataTypes.BIGINT,
      field: 'partner_account_id',
      allowNull: false,
      references: {
        model: partnerAccount(sequelize),
        key: 'id',
      },
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      field: 'is_read',
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
  };
  return sequelize.define(
    'chat_message_is_read_status',
    attributes,
  ) as MessageIsReadStatic;
};
