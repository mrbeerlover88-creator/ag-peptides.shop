export type CatalogProduct = {
  id: string;
  name: string;
  dose: string;
  form: 'PEN' | 'VIAL' | 'WATER';
  price: number;
  stock: number;
  tagline: string;
};
