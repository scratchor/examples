import { DataTypes, Model, BuildOptions, Sequelize } from 'sequelize';
import { SequelizeAttributes } from '../index';

interface IChatRoomAttributes {
  id: number;
  uuid: number;
  createdAt?: Date;
  updatedAt?: Date;
}

type ChatRoomStatic = typeof Model &
  (new (values?: object, options?: BuildOptions) => IChatRoomAttributes);

export default (sequelize: Sequelize) => {
  const attributes: SequelizeAttributes<keyof IChatRoomAttributes> = {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      unique: true,
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
  return sequelize.define('chat_room', attributes) as ChatRoomStatic;
};
