class DatabaseConnection {
  // 1. Hold the single instance in a private static property
  private static instance: DatabaseConnection | null = null;

  // 2. Make the constructor private to prevent "new DatabaseConnection()"
  private constructor() {
    console.log("Database connected successfully!");
  }

  // 3. Provide a public static method to get the instance
  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  // Example method
  public query(sql: string): void {
    console.log(`Executing query: ${sql}`);
  }
}

// ❌ This will cause a TypeScript compile error:
// const db = new DatabaseConnection(); 

//  This is the correct way to use it:
const db1 = DatabaseConnection.getInstance();
const db2 = DatabaseConnection.getInstance();

// Both variables point to the exact same object in the Heap memory
console.log(db1 === db2); // true

db1.query("SELECT * FROM users");
