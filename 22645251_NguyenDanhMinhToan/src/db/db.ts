import * as SQLite from "expo-sqlite";
const db = SQLite.openDatabaseSync("mydatabase.db");

export async function initDB() {
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS products (
            product_id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            price REAL NOT NULL CHECK (price >= 0),
            stock INTEGER NOT NULL CHECK (stock >= 0)
        );
        CREATE TABLE IF NOT EXISTS cart_items(
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            product_id TEXT NOT NULL,
            qty INTEGER NOT NULL CHECK (qty >0),
            UNIQUE(product_id),
            FOREIGN KEY (product_id) REFERENCES products(product_id)
        );
        CREATE TABLE IF NOT EXISTS orders(
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            note TEXT,
            total REAL NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS order_items(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL, 
            qty INTEGER NOT NULL CHECK (qty >0),
            unit_price REAL NOT NULL CHECK (unit_price >=0),
            line_total REAL NOT NULL CHECK (line_total >=0),
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT
        );
    `);
}
export async function seedProducts() {
    const result = await db.getAllAsync<{ count: number }>("SELECT COUNT(*) as count FROM products;");
    if (result[0].count === 0) {
        const products = [
            { id: "p1", name: "Apple", price: 5000, stock: 100 },
            { id: "p2", name: "Banana", price: 3000, stock: 150 },
            { id: "p3", name: "Orange", price: 4000, stock: 120 },
        ];
        for (const product of products) {
            await db.runAsync(
                `INSERT INTO products (product_id, name, price, stock) VALUES (?, ?, ?, ?);`,
                [product.id, product.name, product.price, product.stock]
            );
        }
    }
}
export default db;