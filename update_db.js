const db = require('./database');

async function updateDb() {
  try {
    console.log('Adding user_id to company table...');
    try {
      await db.execute('ALTER TABLE company ADD COLUMN user_id INT AFTER id');
      console.log('Added user_id column successfully.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('user_id column already exists.');
      } else {
        throw e;
      }
    }
    
    // Assign existing companies to user 1 if user_id is null
    await db.execute('UPDATE company SET user_id = 1 WHERE user_id IS NULL');
    
    console.log('Database updated successfully!');
  } catch (e) {
    console.error('Failed:', e);
  } finally {
    process.exit(0);
  }
}

updateDb();
