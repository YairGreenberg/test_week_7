export class UpdateSellItemDto {
  id: string; // מזהה הפריט
  quantity: number; // הכמות למכירה
}

export class UpdateSellRequestDto {
  // תיקון: שימוש ב-UpdateSellItemDto שהגדרת למעלה
  sales: UpdateSellItemDto[]; 
}