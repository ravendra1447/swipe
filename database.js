const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Create Tables
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS parties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        phone TEXT,
        due REAL,
        type TEXT,
        initials TEXT,
        color TEXT,
        email TEXT,
        gstin TEXT,
        company_name TEXT,
        billing_address TEXT,
        shipping_address TEXT,
        tds REAL,
        tcs REAL,
        rcm_applicable INTEGER,
        notes TEXT,
        tags TEXT,
        credit_limit REAL,
        state TEXT,
        linked_customer_id INTEGER
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        invoice TEXT,
        date TEXT,
        amount REAL,
        status TEXT,
        by_user TEXT,
        hasWhatsapp INTEGER
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        price TEXT,
        tag TEXT,
        discount TEXT
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS dashboard_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sales REAL,
        purchases REAL
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS product_details (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        selling_price REAL,
        tax_rate REAL,
        purchase_price REAL,
        quantity REAL,
        unit TEXT,
        category TEXT,
        hsn_code TEXT,
        type TEXT,
        barcode TEXT,
        description TEXT
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS payments_timeline (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        type TEXT,
        amount REAL,
        reference TEXT
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS gstr1_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        gstin TEXT,
        receiver_name TEXT,
        tab_type TEXT,
        date TEXT
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS company (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        logo TEXT,
        phone TEXT,
        email TEXT,
        address TEXT,
        gst_number TEXT,
        pan TEXT,
        state TEXT,
        alternate_phone TEXT,
        website TEXT,
        business_type TEXT
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS bank_accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_holder_name TEXT,
        account_no TEXT,
        ifsc_code TEXT,
        bank_name TEXT,
        branch_name TEXT,
        upi_id TEXT,
        upi_number TEXT,
        opening_balance REAL,
        notes TEXT,
        is_default INTEGER
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS signatures (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        type TEXT,
        data TEXT
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT
      )`);

      // Seed Data (if empty)
      db.get("SELECT COUNT(*) AS count FROM parties", (err, row) => {
        if (row.count === 0) {
          console.log('Seeding parties...');
          const stmt = db.prepare("INSERT INTO parties (name, phone, due, type, initials, color, email, gstin, company_name, billing_address, shipping_address, tds, tcs, rcm_applicable, notes, tags, credit_limit, state, linked_customer_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
          stmt.run('Adarsh D', '9823664474', 10000.00, 'collect', 'AD', 'pink', 'adarsh@example.com', null, 'Adarsh Enterprises', null, null, 0, 0, 0, null, null, 0, null, null);
          stmt.run('AR ENTERPRISES', '', 25587.00, 'pay', 'AE', 'teal', null, '29XYZDE1234F1Z6', 'AR Enterprises', null, null, 0, 0, 0, null, null, 0, null, null);
          stmt.run('Jainam Shah', '8780767186', 763.00, 'pay', 'JS', 'green', null, null, null, null, null, 0, 0, 0, null, null, 0, null, null);
          stmt.run('Seemith', '8787878754', 8885.00, 'pay', 'S', 'indigo', null, null, null, null, null, 0, 0, 0, null, null, 0, null, null);
          stmt.run('Vibhav', '4252412211', 0.00, 'none', 'V', 'red', null, null, null, null, null, 0, 0, 0, null, null, 0, null, null);
          stmt.finalize();
        }
      });

      db.get("SELECT COUNT(*) AS count FROM transactions", (err, row) => {
        if (row.count === 0) {
          console.log('Seeding transactions...');
          const stmt = db.prepare("INSERT INTO transactions (name, invoice, date, amount, status, by_user, hasWhatsapp) VALUES (?, ?, ?, ?, ?, ?, ?)");
          stmt.run('SK TOOLS COPORTATION', 'FY-23-24/222', '24 Jul 2023', 15588, 'pending', 'rupa', 0);
          stmt.run('Meenakshi', 'FY-23-24/221', '24 Jul 2023', 1299, 'pending', 'rupa', 0);
          stmt.run('TALENT', 'FY-23-24/220', '24 Jul 2023', 2500, 'pending', 'rupa', 1);
          stmt.finalize();
        }
      });

      db.get("SELECT COUNT(*) AS count FROM products", (err, row) => {
        if (row.count === 0) {
          console.log('Seeding products...');
          const stmt = db.prepare("INSERT INTO products (title, price, tag, discount) VALUES (?, ?, ?, ?)");
          stmt.run('Diwali Alpana Pack + Chocolates', '₹ 1200.00', 'DIWALI GIFTS', null);
          stmt.run('Diwali Special Box', '', 'DIWALI GIFTS', '5% OFF');
          stmt.finalize();
        }
      });

      db.get("SELECT COUNT(*) AS count FROM dashboard_stats", (err, row) => {
        if (row.count === 0) {
          console.log('Seeding stats...');
          db.run("INSERT INTO dashboard_stats (sales, purchases) VALUES (10000609000, 31200000)"); // Using values close to ₹100006.09Cr and ₹3.12Cr in raw numbers for simplicity
        }
      });

      db.get("SELECT COUNT(*) AS count FROM product_details", (err, row) => {
        if (row.count === 0) {
          console.log('Seeding product_details...');
          const stmt = db.prepare("INSERT INTO product_details (product_id, selling_price, tax_rate, purchase_price, quantity, unit, category, hsn_code, type, barcode, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
          stmt.run(1, 100.00, 0.0, 0.00, 0.00, 'OTH', 'ADD', '00000000', 'Product', '00000000', 'Create your first invoice with ease using our sample product!');
          stmt.finalize();
        }
      });

      db.get("SELECT COUNT(*) AS count FROM payments_timeline", (err, row) => {
        if (row.count === 0) {
          console.log('Seeding payments_timeline...');
          const stmt = db.prepare("INSERT INTO payments_timeline (date, type, amount, reference) VALUES (?, ?, ?, ?)");
          stmt.run('24 Jul 2026', 'received', 15000.00, 'INV-001');
          stmt.run('25 Jul 2026', 'paid', 5000.00, 'EXP-001');
          stmt.finalize();
        }
      });

      db.get("SELECT COUNT(*) AS count FROM gstr1_records", (err, row) => {
        if (row.count === 0) {
          console.log('Seeding gstr1_records...');
          const stmt = db.prepare("INSERT INTO gstr1_records (gstin, receiver_name, tab_type, date) VALUES (?, ?, ?, ?)");
          stmt.run('29ABCDE1234F1Z5', 'Acme Corp', 'B2B', '15-07-2026');
          stmt.run('29XYZDE1234F1Z6', 'Globex Inc', 'B2B', '16-07-2026');
          stmt.run('Unregistered', 'John Doe', 'B2CL', '17-07-2026');
          stmt.finalize();
        }
      });

      db.get("SELECT COUNT(*) AS count FROM users", (err, row) => {
        if (row.count === 0) {
          console.log('Seeding users...');
          // Using a simple mock hashed password for 'password123'
          const bcrypt = require('bcryptjs');
          const hash = bcrypt.hashSync('password123', 8);
          db.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", ['Admin User', 'admin@example.com', hash, 'admin']);
        }
      });

      db.get("SELECT COUNT(*) AS count FROM company", (err, row) => {
        if (row.count === 0) {
          db.run("INSERT INTO company (name, gst_number, phone, email, address, state, pan, alternate_phone, website, business_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            ['Swipe demo', '29ABCDE1234F1Z5', '9876543210', 'admin@swipedemo.com', 'Q-city, 2nd Floor Block A\nHyderabad, TELANGANA, 500032', 'Telangana', '', '', '', ''],
            (err) => { if (!err) console.log("Seeding company..."); }
          );
        }
      });

      db.get("SELECT COUNT(*) AS count FROM bank_accounts", (err, row) => {
        if (row.count === 0) {
          db.run("INSERT INTO bank_accounts (account_holder_name, account_no, ifsc_code, bank_name, branch_name, upi_id, upi_number, opening_balance, notes, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            ['Swipe Demo Acc', '1234567890', 'SBIN0001234', 'State Bank of India', 'Main Branch', 'swipedemo@ybl', '9876543210', 0.0, '', 1],
            (err) => { if (!err) console.log("Seeding bank accounts..."); }
          );
        }
      });

      // Default Settings
      db.get("SELECT COUNT(*) AS count FROM app_settings", (err, row) => {
        if (row.count === 0) {
          const stmt = db.prepare("INSERT INTO app_settings (key, value) VALUES (?, ?)");
          stmt.run('selected_template', 'Modern');
          stmt.run('price_decimal_format', '2');
          stmt.run('show_details', 'true');
          stmt.finalize();
          console.log("Seeding default settings...");
        }
      });
    });
  }
});

module.exports = db;
