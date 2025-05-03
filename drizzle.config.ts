// import 'dotenv/config';
import * as  dotenv from "dotenv"
import { defineConfig } from 'drizzle-kit';

dotenv.config({
    path: ".env"
})

if (!process.env.DATABASE_URL) {
    throw new Error("Database url is not set in .env")
}

export default defineConfig({
    schema: './lib/db/schema.ts',
    out: './drizzle',                // out -> output file -> drizzle behind the series writes a lot of sql queries and hence for this it generates a output file -> same as migration file -> hence need to write its location.
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },

    // more configurations that we can do apart from the upper ones (which are compulsory), below ones are optional.
    migrations: {
        table: "__drizzle_migration",
        schema: "public"
    },
    verbose: true,              // this will show all the things as true, which drizzle is doing behind the scenes.
    strict: true,               // this doesn't stop you from doing anything, it just gives up a pop-up... stating the confirmation for the tasks to execute.

});
