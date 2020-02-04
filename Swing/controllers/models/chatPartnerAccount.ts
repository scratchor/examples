import { DataTypes, Model, BuildOptions, Sequelize } from 'sequelize';
import { SequelizeAttributes } from '../index';
import chatRoom from './chatRoom';
import partnerAccount from './partnerAccount';
import chatPartnerAccountChild from './chatPartnerAccountChild';

interface IChatPartnerAccountAttributes {
  chatRoomUuid: number;
  partnerAccountId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

type ChatPartnerAccountStatic = typeof Model &
  (new (
    values?: object,
    options?: BuildOptions,
  ) => IChatPartnerAccountAttributes);

export default (sequelize: Sequelize) => {
  const attributes: SequelizeAttributes<keyof IChatPartnerAccountAttributes> = {
    chatRoomUuid: {
      type: DataTypes.UUID,
      field: 'chat_room_uuid',
      primaryKey: true,
      allowNull: false,
      references: {
        model: chatRoom(sequelize),
        key: 'uuid',
      },
    },
    partnerAccountId: {
      type: DataTypes.BIGINT,
      field: 'partner_account_id',
      primaryKey: true,
      allowNull: false,
      references: {
        model: partnerAccount(sequelize),
        key: 'id',
      },
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
    'chat_partner_account',
    attributes,
  ) as ChatPartnerAccountStatic;
};
