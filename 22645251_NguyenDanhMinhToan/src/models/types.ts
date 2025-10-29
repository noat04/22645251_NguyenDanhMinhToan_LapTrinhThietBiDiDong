export type Product = {
  product_id: string;
  name: string;
  price: number;
  stock: number;
};

export type CartItem = {
  id: number;
  product_id: string;
  name: string;
  price: number;
  qty: number;
  stock: number;
};
export type Order = {
  id: number;
  note?: string;
  total: number;
  created_at: string;
};

export type OrderItem = {
  id: number;
  order_id: number;
  product_id: string;
  qty: number;
  unit_price: number;
  line_total: number;
  name?: string; // Để JOIN hiển thị tên sản phẩm
};