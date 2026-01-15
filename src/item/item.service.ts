import { Injectable, Inject, BadRequestException, Logger, OnModuleInit } from '@nestjs/common';
import { Item } from './entities/item.entity';
import * as fs from 'fs';
import * as path from 'path';

export interface PurchaseResult {
  id: number;
  name: string;
  newQuantity: number;
  spent: number;
}

export interface SellResult {
  name: string;
  newQuantity: number;
  refundGenerated: number;
}

@Injectable()
export class ItemService implements OnModuleInit {
  private readonly logger = new Logger(ItemService.name);
  private readonly budgetPath = path.join(process.cwd(), 'budget.txt');
  private budget: number = 0;

  constructor(
    @Inject('ITEM_REPOSITORY')
    private itemRepository: typeof Item,
  ) {}

  onModuleInit() {
    try {
      if (!fs.existsSync(this.budgetPath)) {
        fs.writeFileSync(this.budgetPath, '10000'); 
      }
      const data = fs.readFileSync(this.budgetPath, 'utf8');
      this.budget = parseFloat(data);
    } catch (err) {
      this.logger.error('Error loading budget file');
      this.budget = 0;
    }
  }

  private saveBudgetToFile() {
    fs.writeFileSync(this.budgetPath, this.budget.toString());
  }

  async purchase(dto: any) {
    let totalCost = 0;
    dto.purchases.forEach(p => totalCost += (p.quantity * p.pricePerUnit));

    if (this.budget - totalCost < 0) {
      throw new BadRequestException('Not enough budget for this purchase');
    }

    // תיקון השגיאה: הגדרת הטיפוס למערך
    const results: PurchaseResult[] = []; 

    for (const p of dto.purchases) {
      let item = await this.itemRepository.findOne({ where: { name: p.name } });

      if (item) {
        item.quantity += p.quantity;
        item.price = p.pricePerUnit; 
        await item.save();
      } else {
        item = await this.itemRepository.create({
          name: p.name,
          quantity: p.quantity,
          price: p.pricePerUnit,
        } as any);
      }

      results.push({
        id: (item as any).id, // שימוש ב-as any כדי למנוע בעיות טיפוס של Sequelize ב-id
        name: item.name,
        newQuantity: item.quantity,
        spent: p.quantity * p.pricePerUnit
      });
    }

    this.budget -= totalCost;
    this.saveBudgetToFile();

    return { results, currentBudget: this.budget };
  }

  async sell(dto: any) {
    // תיקון השגיאה: הגדרת הטיפוס למערך
    const results: SellResult[] = []; 

    for (const s of dto.sales) {
      const item = await this.itemRepository.findOne({ where: { name: s.name } });

      if (!item || item.quantity < s.quantity) {
        throw new BadRequestException(`Invalid sale: ${s.name} not found or insufficient stock`);
      }

      const moneyFromSale = s.quantity * item.price;
      const refund = moneyFromSale * 0.9;

      item.quantity -= s.quantity;
      await item.save();

      this.budget += refund;
      results.push({ 
        name: item.name, 
        newQuantity: item.quantity, 
        refundGenerated: refund 
      });
    }

    this.saveBudgetToFile();
    return { results, currentBudget: this.budget };
  }
}