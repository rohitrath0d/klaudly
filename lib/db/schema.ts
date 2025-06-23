// read drizzle orm documentation --> designing schema

// creating tables/schema:

import {pgTable, text, uuid, integer, boolean, timestamp} from "drizzle-orm/pg-core"        // pg-core -> postgres-core -> comes from neon -> Neon -> a version of postgres
import {relations} from "drizzle-orm"

export const files = pgTable("files", {
    id: uuid("id").defaultRandom().primaryKey(),             // every other project or every other row in db is to be uniquely identified -> uuid as id
                                                            // hence drizzle has some methods for uuid --> defaultRandom -> generates a random id -> primarykey() -> lets uuid identify as primary key -> so that searching can be done based on that.

    
    // basic file/folder information
    // file & folder has no difference -> it just how you store them and put properties on them -> is the most important thing.
    name: text("name").notNull(),           // name -> of the file -> text("name") format : indicates that text attached with name itself -> and cannot be null
    path: text("path").notNull(),           //   /document/project/resume.pdf vala path -> not the file url path 
    size: integer("size").notNull(),
    type: text("type").notNull(),            // this specifies the mimeType(for img -> jpg/png || file -> .pdf .docx || or a hardcoded value for --> "folder" -> (coz it has no special types) of the file -> in the text format -> cannot be null.                                               

    // storage information
    fileUrl: text("file_url").notNull(),           // url to access the file
    thumbnailUrl : text("thumbnail_url"),           // this is optional -> hence not null -> it can be null.

    // Ownership information
    userId: text("user_id").notNull(),
    // path ex : document/projects/resume.pdf  --> it has a parent folder or parent element in the hierarchical structure -> such as /resume.pdf ka parent -> /project  ka parent -> /document
    parentId: uuid("parent_id"),           // parent folder id(null for root items)

    // file/folder flags  -> e.g. bookmark, returns a boolean value, and based on that we can write sql query.
    isFolder : boolean("is_folder").default(false).notNull(),           // treating everything as a file, but if this flag is on, it's a folder.
    isStarred: boolean("is_starred").default(false).notNull(),
    isTrash: boolean("is_trash").default(false).notNull(),

    // creating createdAt and updatedAt -> in mongoose it's provided with built-in timestamp, but in this we have to manually create it.
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),

});


// now in this application, what we majorly have to learn is having a relationship with the own table --> SELF RELATION
// and in this application we just have one table, we have to learn about -> SELF RELATION (special use-case/feature of the app)

/*
parent: Each file/folder can have one parent folder

children:  Each folder can have many child files/folder
*/
export const filesRelations = relations(files, ({one, many}) => ({
    // the reason we are calling one-to-many is because -> Folder -> parent -> files -> many -> hence one-to-many

    parent: one(files, {
        fields: [files.parentId],           // if you are a parent, you should have a parentId, if null thats also fine
    
        references: [files.id]              // reference -> self reference -> file reference.
    }),

    // relationship to child file/folder
    children: many(files)           // indicates -> there could be many childrens inside one folder -> meaning many files inside one folder.
}));


// Type definitions  -> super power of drizzle

// export const File = typeof files.$inferSelect              // -> this has nothing to do with the database itself, it's just exporting me a variable known as file, and whenever i use this type of schema, it can give me a suggestion for using this.
export type File = typeof files.$inferSelect              // -> this has nothing to do with the database itself, it's just exporting me a variable known as file, and whenever i use this type of schema, it can give me a suggestion for using this.
// export const NewFile = typeof files.$inferInsert           // -> at the time of inserting anything in the database, or to get any value outside of the database, it will mark what is compulsory and what is not, and if we change the schema it automatically re-generates the schema too.
export type NewFile = typeof files.$inferInsert           // -> at the time of inserting anything in the database, or to get any value outside of the database, it will mark what is compulsory and what is not, and if we change the schema it automatically re-generates the schema too.



/* 
type File = {
id: string;
name: string;
isFolder: boolean;
// plus other inferred fields 
}
Now behind, the scenes we are using typescript, and it invests heavily on type, since the file table, will be having some of its type definition(such as string, integer), which are mandatory to use, and which is not mandatory to use -> (null & not-null).
hence, we dont need to write big code for that, its just done in one line.
Meaning, inferSelect -> infers the selection, which is good and mandate
*/