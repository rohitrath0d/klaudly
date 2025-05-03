// read documentation -> connecting to database -> using neon

import { drizzle } from 'drizzle-orm/neon-http';     // connecting to drizzle ORM to the neon database
import {neon} from "@neondatabase/serverless"       // connecting to neon

import * as schema from "./schema"              // import * -> means import everything(*)


// connecting to database
const sql = neon(process.env.DATABASE_URL!)        

export const db = drizzle(sql, {schema})             // SUMMARY:- wires the drizzle

// export {sql}  -> lets use raw sql queries.
// we can export sql as a separate object as well. -> but for now we are exporting it with db.

// The most important part here, is, why we are exporting this 2 things -> and what do they actually do?
// export const db = drizzle(sql, {schema})  -> this is a connection here, via drizzle itself. everything that u do -> querying the db and such things happen via drizzle itself -> and lets use the drizzle objects.
// export {sql} -> lets import the sql -> just lets fire the raw queries to the neon directly -> and with neon/serverless.. we can actually do that.
// SUMMARY:- 
