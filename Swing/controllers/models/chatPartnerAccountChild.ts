import { DataTypes, Model, BuildOptions, Sequelize } from 'sequelize';
import { SequelizeAttributes } from '../index';
import chatPartnerAccount from './chatPartnerAccount';
import chatPartnerAccountChild from './chatPartnerAccount';
import chatRoom from './chatRoom';

interface IChatPartnerAccountChildAttributes {
  /*  chatPartnerAccountRoomUuid: number;
  chatPartnerAccountPartnerAccountId: number;
  chatPartnerAccountChildRoomUuid: number;
  chatPartnerAccountChildPartnerAccountId: number;*/
  createdAt?: Date;
  updatedAt?: Date;
}

type ChatPartnerAccountChildStatic = typeof Model &
  (new (
    values?: object,
    options?: BuildOptions,
  ) => IChatPartnerAccountChildAttributes);

export default (sequelize: Sequelize) => {
  const attributes: SequelizeAttributes<
    keyof IChatPartnerAccountChildAttributes
  > = {
    /*    chatPartnerAccountRoomUuid: {
      type: DataTypes.UUID,
      field: 'chat_partner_account_room_uuid',
      primaryKey: true,
      allowNull: false,
      references: {
        model: chatPartnerAccount(sequelize),
        key: 'chatRoomUuid',
      },
    },
    chatPartnerAccountPartnerAccountId: {
      type: DataTypes.BIGINT,
      field: 'chat_partner_account_partner_account_id',
      primaryKey: true,
      allowNull: false,
      references: {
        model: chatPartnerAccount(sequelize),
        key: 'partnerAccountId',
      },
    },
    chatPartnerAccountChildRoomUuid: {
      type: DataTypes.UUID,
      field: 'chat_partner_account_child_room_uuid',
      primaryKey: true,
      allowNull: false,
      references: {
        model: chatPartnerAccountChild(sequelize),
        key: 'chatPartnerAccountRoomUuid',
      },
    },
    chatPartnerAccountChildPartnerAccountId: {
      type: DataTypes.BIGINT,
      field: 'chat_partner_account_child_partner_account_id',
      primaryKey: true,
      allowNull: false,
      references: {
        model: chatPartnerAccountChild(sequelize),
        key: 'chatPartnerAccountPartnerAccountId',
      },
    },*/
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
    'chat_partner_account_child',
    attributes,
  ) as ChatPartnerAccountChildStatic;
};
