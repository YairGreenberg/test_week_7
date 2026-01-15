import { Module } from '@nestjs/common';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';
import { itemProviders } from './entities/item.provider';

@Module({
  controllers: [ItemController],
  providers: [
    ItemService,
    ...itemProviders, // רישום ה-Providers במערך
  ],
})
export class ItemModule {}