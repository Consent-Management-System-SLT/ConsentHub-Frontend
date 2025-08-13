import { MongoClient } from "mongodb";

async function testConnection() {
  const uri = "mongodb://localhost:27017";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("MongoDB connection successful!");
    const databases = await client.db().admin().listDatabases();
    console.log(
      "Databases:",
      databases.databases.map((db) => db.name)
    );
  } catch (err) {
    console.error("MongoDB connection failed:", err);
  } finally {
    await client.close();
  }
}

testConnection();
