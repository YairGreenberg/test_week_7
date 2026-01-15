import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'Items' })
export class Item extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true, // קריטי כדי שנוכל לחפש לפי שם מוצר
  })
  name: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  quantity: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  price: number;
}