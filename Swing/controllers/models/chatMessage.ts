import { DataTypes, Model, BuildOptions, Sequelize } from 'sequelize';
import { SequelizeAttributes } from '../index';
import chatRoom from './chatRoom';
import partnerAccount from './partnerAccount';

interface IChatMessageAttributes {
  id: number;
  uuid: number;
  chatRoomUuid: number;
  senderPartnerAccountId: number;
  video: string;
  picture: string;
  text: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type ChatMessagetatic = typeof Model &
  (new (values?: object, options?: BuildOptions) => IChatMessageAttributes);

export default (sequelize: Sequelize) => {
  const attributes: SequelizeAttributes<keyof IChatMessageAttributes> = {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    chatRoomUuid: {
      type: DataTypes.UUID,
      field: 'chat_room_uuid',
      allowNull: false,
      references: {
        model: chatRoom(sequelize),
        key: 'uuid',
      },
    },
    senderPartnerAccountId: {
      type: DataTypes.BIGINT,
      field: 'sender_partner_account_id',
      allowNull: false,
      references: {
        model: partnerAccount(sequelize),
        key: 'id',
      },
    },
    video: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    picture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: true,
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
  return sequelize.define('chat_message', attributes) as ChatMessagetatic;
};
