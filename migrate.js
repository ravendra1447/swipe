const mysql = require('mysql2/promise');
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'swipe_user',
  password: process.env.DB_PASSWORD || 'swipe@123',
  database: process.env.DB_NAME || 'swipe_db'
};

async function migrate() {
  const connection = await mysql.createConnection(dbConfig);
  try {
    console.log('Running migrations...');
    
    // Drop the tables to recreate with full schema
    await connection.execute('DROP TABLE IF EXISTS eway_bills');
    await connection.execute('DROP TABLE IF EXISTS einvoices');
    await connection.execute('DROP TABLE IF EXISTS document_items');
    
    await connection.execute(`
      CREATE TABLE eway_bills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        billNumber VARCHAR(100),
        amount DECIMAL(15,2),
        status VARCHAR(50),
        supplierGSTIN VARCHAR(50),
        supplierName VARCHAR(255),
        recipientGSTIN VARCHAR(50),
        recipientName VARCHAR(255),
        placeOfDispatch VARCHAR(255),
        placeOfDelivery VARCHAR(255),
        docNo VARCHAR(100),
        docDate VARCHAR(100),
        docType VARCHAR(100),
        hsnCode VARCHAR(100),
        transportReason VARCHAR(100),
        transactionType VARCHAR(100),
        transportMode VARCHAR(100),
        vehicleNo VARCHAR(100),
        transporterId VARCHAR(100),
        transporterName VARCHAR(255),
        transporterDoc VARCHAR(100),
        transporterDocDate VARCHAR(100),
        fromPlace VARCHAR(255),
        toPlace VARCHAR(255)
      )
    `);
    
    await connection.execute(`
      CREATE TABLE einvoices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        invoice_number VARCHAR(100),
        amount DECIMAL(15,2),
        status VARCHAR(50),
        supplierGSTIN VARCHAR(50),
        supplierName VARCHAR(255),
        recipientGSTIN VARCHAR(50),
        recipientName VARCHAR(255),
        placeOfDispatch VARCHAR(255),
        placeOfDelivery VARCHAR(255),
        docNo VARCHAR(100),
        docDate VARCHAR(100),
        docType VARCHAR(100),
        hsnCode VARCHAR(100),
        transportReason VARCHAR(100),
        transactionType VARCHAR(100),
        transportMode VARCHAR(100),
        vehicleNo VARCHAR(100),
        transporterId VARCHAR(100),
        transporterName VARCHAR(255),
        transporterDoc VARCHAR(100),
        transporterDocDate VARCHAR(100),
        fromPlace VARCHAR(255),
        toPlace VARCHAR(255)
      )
    `);

    await connection.execute(`
      CREATE TABLE document_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        document_id INT,
        document_type VARCHAR(50),
        sn VARCHAR(10),
        hsn VARCHAR(50),
        description VARCHAR(255),
        qty VARCHAR(50),
        unit VARCHAR(50),
        val VARCHAR(50)
      )
    `);
    
    console.log('Migration completed successfully!');
  } catch (e) {
    console.error('Migration failed:', e);
  } finally {
    await connection.end();
  }
}

migrate();
