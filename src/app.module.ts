import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ItemModule } from './item/item.module';
import { DbModule } from './database/db.module';

@Module({
  imports: [ItemModule,DbModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
