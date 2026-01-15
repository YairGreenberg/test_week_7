export class CreateItemDto {
  id: string; //
  name: string; //
  type: string; //
  quantity: number; //
  pricePerUnit: number; //
}

export class PurchaseRequestDto {
  purchases: CreateItemDto[]; //
}

//שדות שחובה לשלוח כשהצבא קונה ציוד