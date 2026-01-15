import { Item } from "./item.entity";


export const itemProviders = [
  {
    provide: 'ITEM_REPOSITORY',
    useValue: Item,
  },
];