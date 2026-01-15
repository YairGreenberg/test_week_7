import { Sequelize } from 'sequelize-typescript';
import { Item } from '../item/entities/item.entity';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: 'mysql',
        host: '172.0.0.1',
        port: 3306,
        username: 'root',
        password: '951753', //ubby here your MySQL password
        database: 'soliders', // שם בסיס הנתונים שלך
      });
      sequelize.addModels([Item]); // רישום המודל שיוצר את הטבלה
      await sequelize.sync(); // יצירת הטבלה אוטומטית ב-DB
      return sequelize;
    },
  },
];