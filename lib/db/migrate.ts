// migrations are provided by drizzle, but we can also write up our own custom migrations 
import { migrate } from "drizzle-orm/neon-http/migrator";
import { drizzle } from "drizzle-orm/neon-http"       // connecting to http
import { neon } from "@neondatabase/serverless"

import * as dotenv from "dotenv"

// this is just a safety check, that if database is not found, pls throw error/ dont allow the access.
dotenv.config({
    path: ".env.local"
});

if (!process.env.DATABASE_URL) {
    throw new Error("Database url is not set in the environment variables");
}


// custom migration function:
async function runMigration() {
    try {
        const sql = neon(process.env.DATABASE_URL!);

        // initialize the connection
        const db = drizzle(sql);  // whenever we initialize a connection, we do it through db (drizzle).

        // migration:
        await migrate(db, { migrationsFolder: "./drizzle" });          // fetch what need to be migrated(db), and where (the path of the folder)
        console.log("All migrations are successfully done!");

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        console.log("All migrations are successfully done!");

        //exit the process if migrations are not done properly.
        process.exit(1);
    }

}

runMigration()