import { Injectable, OnModuleInit, BadRequestException, Logger } from '@nestjs/common';
import { PurchaseRequestDto } from './dto/create-item.dto';
import { UpdateSellRequestDto } from './dto/update-item.dto';
import * as fs from 'fs';
import * as path from 'path';

// תיקון: הוספת export לכל ממשק כדי שיהיה נגיש מחוץ למחלקה
export interface PurchaseResult {
  id: string | number;
  newQuantity: number;
  spent: number;
}

export interface SellResult {
  id: string | number;
  newQuantity: number;
}

@Injectable()
export class ItemService implements OnModuleInit {
  private readonly logger = new Logger(ItemService.name);
  private readonly budgetPath = path.join(process.cwd(), 'budget.txt');
  private budget: number = 0;
  private items: any[] = []; // אחסון הפריטים באותה טבלה/אוסף [cite: 5]

  onModuleInit() {
    try {
      if (!fs.existsSync(this.budgetPath)) {
        fs.writeFileSync(this.budgetPath, '10000'); // יצירת קובץ תקציב אם חסר [cite: 13]
      }
      const data = fs.readFileSync(this.budgetPath, 'utf8');
      this.budget = parseFloat(data);
    } catch (err) {
      this.logger.error('Error loading budget file');
      this.budget = 0;
    }
  }

  private saveBudgetToFile() {
    fs.writeFileSync(this.budgetPath, this.budget.toString()); // כתיבה לתקציב באמצעות fs [cite: 13]
  }

  // --- פעולת קנייה (Purchase) ---
  async purchase(dto: PurchaseRequestDto) {
    let totalCost = 0;
    // חישוב עלות לפי כמות ומחיר ליחידה [cite: 27]
    dto.purchases.forEach(p => totalCost += (p.quantity * p.pricePerUnit));

    // דחייה אם התקציב יורד מתחת ל-0 [cite: 19, 34, 61]
    if (this.budget - totalCost < 0) {
      this.logger.error('Purchase rejected: Insufficient budget');// [cite: 37]
      throw new BadRequestException('Not enough budget for this purchase'); //[cite: 35]
    }

    const results: PurchaseResult[] = []; // שימוש בטיפוס המיוצא

    for (const p of dto.purchases) {
      let item = this.items.find(i => i.id === p.id);
      
      if (item) {
        item.quantity += p.quantity; // עדכון כמות אם קיים [cite: 33, 58]
      } else {
        item = { 
          ...p, 
          hasImage: false // יצירה חדשה, מתחיל כ-false [cite: 31, 59, 60]
        };
        this.items.push(item);
      }
      
      results.push({ 
        id: item.id, 
        newQuantity: item.quantity, 
        spent: p.quantity * p.pricePerUnit 
      });
    }

    this.budget -= totalCost; // הפחתת התקציב [cite: 28, 42]
    this.saveBudgetToFile();

    return { results };
  }

  // --- פעולת מכירה (Sell) ---
  async sell(dto: UpdateSellRequestDto) {
    // בדיקה שכל הפריטים קיימים ובמלאי מספיק [cite: 105, 125, 126]
    for (const s of dto.sales) {
      const item = this.items.find(i => i.id === s.id);
      if (!item || item.quantity < s.quantity) {
        this.logger.error('Invalid sale request'); //[cite: 113]
        throw new BadRequestException('Invalid sale request'); //[cite: 112]
      }
    }

    const results: SellResult[] = []; // שימוש בטיפוס המיוצא

    for (const s of dto.sales) {
      const item = this.items.find(i => i.id === s.id);
      const money = s.quantity * item.pricePerUnit;
      const refund = money * 0.9; // הפחתת 10% בשל שימוש [cite: 107, 127]

      item.quantity -= s.quantity; // עדכון מלאי ב-DB [cite: 110]
      this.budget += refund; // הוספת כסף לתקציב [cite: 6, 109]
      
      results.push({ id: item.id, newQuantity: item.quantity });
    }

    this.saveBudgetToFile();
    return { results };
  }
}