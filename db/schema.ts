import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * The tables mirror the Laravel migrations of the original Wedspiration app.
 * Sessions, password resets and the remember token are not needed:
 * Auth.js keeps the login in a signed cookie (JWT).
 */

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  ...timestamps,
});

export const weddingFolders = pgTable(
  "wedding_folders",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    notes: text("notes"),
    weddingDate: date("wedding_date"),
    ...timestamps,
  },
  (table) => [index("wedding_folders_user_id_index").on(table.userId)],
);

// Subcategories are created by admins and photos are sorted into them
export const subcategories = pgTable("subcategories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  ...timestamps,
});

export const photos = pgTable(
  "photos",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 20 }),
    // Deleting a subcategory keeps its photos (the link becomes empty)
    subcategoryId: integer("subcategory_id").references(() => subcategories.id, {
      onDelete: "set null",
    }),
    // A seeded sample ("/images/seed/..."), an external link or a Vercel Blob URL
    imagePath: text("image_path").notNull(),
    // Stored on upload, so the gallery can reserve the right space before the image loads
    imageWidth: integer("image_width").notNull().default(1200),
    imageHeight: integer("image_height").notNull().default(900),
    ...timestamps,
  },
  (table) => [
    index("photos_user_id_index").on(table.userId),
    index("photos_created_at_index").on(table.createdAt),
  ],
);

export const folderPhoto = pgTable(
  "folder_photo",
  {
    folderId: integer("folder_id")
      .notNull()
      .references(() => weddingFolders.id, { onDelete: "cascade" }),
    photoId: integer("photo_id")
      .notNull()
      .references(() => photos.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.folderId, table.photoId] })],
);

export const usersRelations = relations(users, ({ many }) => ({
  folders: many(weddingFolders),
  photos: many(photos),
}));

export const weddingFoldersRelations = relations(weddingFolders, ({ one, many }) => ({
  user: one(users, { fields: [weddingFolders.userId], references: [users.id] }),
  folderPhotos: many(folderPhoto),
}));

export const subcategoriesRelations = relations(subcategories, ({ many }) => ({
  photos: many(photos),
}));

export const photosRelations = relations(photos, ({ one, many }) => ({
  user: one(users, { fields: [photos.userId], references: [users.id] }),
  subcategory: one(subcategories, {
    fields: [photos.subcategoryId],
    references: [subcategories.id],
  }),
  folderPhotos: many(folderPhoto),
}));

export const folderPhotoRelations = relations(folderPhoto, ({ one }) => ({
  folder: one(weddingFolders, { fields: [folderPhoto.folderId], references: [weddingFolders.id] }),
  photo: one(photos, { fields: [folderPhoto.photoId], references: [photos.id] }),
}));

export type User = typeof users.$inferSelect;
export type WeddingFolder = typeof weddingFolders.$inferSelect;
export type Photo = typeof photos.$inferSelect;
export type Subcategory = typeof subcategories.$inferSelect;
