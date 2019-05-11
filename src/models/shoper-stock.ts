import { ShoperProduct } from "./shoper-product";

export type ShoperStock = {
  stock_id: string;
  extended: string;
  price: string;
  price_buying: string;
  price_type: string;
  stock: string;
  package: string;
  warn_level: string;
  sold: string;
  weight: string;
  weight_type: string;
  active: string;
  default: string;
  product_id: string;
  availability_id: string;
  delivery_id: string;
  gfx_id: string;
  code: string;
  ean: string;
  comp_weight: string;
  comp_price: string;
  comp_promo_price: string;
  price_wholesale: string;
  comp_price_wholesale: string;
  comp_promo_price_wholesale: string;
  price_special: string;
  comp_price_special: string;
  comp_promo_price_special: string;
  price_type_wholesale: string;
  price_type_special: string;
  calculation_unit_id: string;
  calculation_unit_ratio: string;
  options?: any;
  parent_product?: ShoperProduct
};

//   "stock_id": "48",
//   "extended": "0",
//   "price": "549.00",
//   "price_buying": "0.00",
//   "price_type": "1",
//   "stock": "3",
//   "package": "0",
//   "warn_level": "1",
//   "sold": "0",
//   "weight": "30",
//   "weight_type": "1",
//   "active": "1",
//   "default": "1",
//   "product_id": "48",
//   "availability_id": null,
//   "delivery_id": "1",
//   "gfx_id": null,
//   "code": "SADIW50801A",
//   "ean": "",
//   "comp_weight": "30",
//   "comp_price": "549.00",
//   "comp_promo_price": "549.00",
//   "price_wholesale": "549.00",
//   "comp_price_wholesale": "549.00",
//   "comp_promo_price_wholesale": "549.00",
//   "price_special": "549.00",
//   "comp_price_special": "549.00",
//   "comp_promo_price_special": "549.00",
//   "price_type_wholesale": "0",
//   "price_type_special": "0",
//   "calculation_unit_id": null,
//   "calculation_unit_ratio": "0",
//   "options": []
