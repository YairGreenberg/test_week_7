import { Controller, Post, Body, Param, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ItemService } from './item.service';
// ייבוא ה-DTOs העוטפים כדי להבטיח תאימות למבנה ה-JSON המצופה
import { PurchaseRequestDto } from './dto/create-item.dto'; 
import { UpdateSellRequestDto } from './dto/update-item.dto'; 
import { FileInterceptor } from '@nestjs/platform-express';

@Controller() // הנתיב הריק מאפשר להגדיר נתיבים מוחלטים בתוך המתודות
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  // 1. רכישת פריטים - POST /transactions/purchase
  @Post('transactions/purchase')
  purchase(@Body() purchaseDto: PurchaseRequestDto) {
    // שליחת כל ה-DTO לסרוויס לטיפול בלוגיקה העסקית
    return this.itemService.purchase(purchaseDto);
  }

  // 2. מכירת פריטים - POST /transactions/sell
  @Post('transactions/sell')
  sell(@Body() sellDto: UpdateSellRequestDto) {
    // שליחת בקשת המכירה לסרוויס לבדיקת מלאי ועדכון תקציב
    return this.itemService.sell(sellDto);
  }

  // 3. בדיקת תמונה - POST /images/check/:itemId
  @Post('images/check/:itemId')
  @UseInterceptors(FileInterceptor('image')) // שם השדה בטופס חייב להיות 'image'
  checkImage(@Param('itemId') itemId: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { itemId, isValid: false, reason: 'No file uploaded' };
    }

    const maxSize = 250 * 1024 * 1024; // מגבלה של 250MB
    const isPng = file.mimetype === 'image/png'; // דרישה לפורמט PNG בלבד
    const isSizeOk = file.size <= maxSize;

    if (!isPng) {
      return { itemId, isValid: false, reason: 'Only PNG allowed' };
    }
    
    if (!isSizeOk) {
      return { itemId, isValid: false, reason: 'File is too large' }; //
    }

    // החזרת תשובה חיובית לפי הפורמט הנדרש
    return { itemId, isValid: true, reason: null };
  }
}