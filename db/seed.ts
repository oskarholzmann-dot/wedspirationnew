import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import type { Database } from "./index";
import { folderPhoto, photos, subcategories, users, weddingFolders } from "./schema";

/**
 * Sample wedding photos in public/images/seed (free Unsplash photos, see CREDITS.md there).
 */
const SAMPLE_IMAGES = [
  { file: "ceremony-1.jpg", category: "ceremony", title: "Rose-lined garden aisle" },
  { file: "reception-1.jpg", category: "reception", title: "Long table with wildflowers" },
  { file: "dress-1.jpg", category: "dress", title: "Lace back detail" },
  { file: "flowers-1.jpg", category: "flowers", title: "Peach rose bouquet" },
  { file: "venue-1.jpg", category: "venue", title: "Garden gazebo" },
  { file: "details-1.jpg", category: "details", title: "Rings on the vows" },
  { file: "ceremony-2.jpg", category: "ceremony", title: "Lakeside ceremony" },
  { file: "reception-2.jpg", category: "reception", title: "Dancing the night away" },
  { file: "dress-2.jpg", category: "dress", title: "Ball gown by the window" },
  { file: "flowers-2.jpg", category: "flowers", title: "Eucalyptus and thistle bouquet" },
  { file: "venue-2.jpg", category: "venue", title: "Fairy-light aisle at night" },
  { file: "details-2.jpg", category: "details", title: "Bridal heels and bouquet" },
  { file: "ceremony-3.jpg", category: "ceremony", title: "Ring exchange in black and white" },
  { file: "reception-3.jpg", category: "reception", title: "Ballroom reception tables" },
  { file: "dress-3.jpg", category: "dress", title: "Flowing veil on the stairs" },
  { file: "flowers-3.jpg", category: "flowers", title: "White and blush bouquet" },
  { file: "venue-3.jpg", category: "venue", title: "Light-filled church" },
  { file: "details-3.jpg", category: "details", title: "Ring resting on roses" },
  { file: "ceremony-4.jpg", category: "ceremony", title: "Autumn forest ceremony" },
  { file: "reception-4.jpg", category: "reception", title: "Candlelit dinner table" },
  { file: "dress-4.jpg", category: "dress", title: "Boho dress at golden hour" },
  { file: "flowers-4.jpg", category: "flowers", title: "Wild autumn bouquet" },
  { file: "venue-4.jpg", category: "venue", title: "Rustic barn with drapes" },
  { file: "details-4.jpg", category: "details", title: "Gold wedding bands" },
];

const DESCRIPTIONS = [
  "We love the soft, natural light in this one.",
  "Exactly the mood we want for our day.",
  null,
  "Could we get a similar shot with our families?",
  "Love the colours - very close to our palette.",
  null,
  "Saw this on a friend's wedding and fell in love.",
];

const FOLDER_NOTES = [
  "Relaxed, documentary style please - no stiff group poses.",
  "Outdoor ceremony, so we would love lots of natural light shots.",
  null,
  "Small wedding with around 40 guests, mostly family.",
  "Please capture the details: rings, flowers and the cake.",
  "We want a golden hour session right after dinner.",
  null,
];

const OTHER_USERS = [
  { name: "Clara Weber", email: "clara@example.com", folder: "Clara & Jonas" },
  { name: "Mia Hoffmann", email: "mia@example.com", folder: "Mia & Felix" },
  { name: "Lena Schulz", email: "lena@example.com", folder: "Lena & Paul" },
  { name: "Sofia Becker", email: "sofia@example.com", folder: "Sofia & Leon" },
  { name: "Emma Wagner", email: "emma@example.com", folder: "Emma & Noah" },
];

/**
 * Fill an empty database with the same kind of sample data as the Laravel seeder.
 * Every account has the password "password".
 */
export async function seedDatabase(db: Database): Promise<void> {
  const password = await bcrypt.hash("password", 10);

  const accounts = [
    // The admin account the teacher logs in with
    { name: "Admin", email: "admin@admin.com", isAdmin: true, folder: "Admin's wedding" },
    // A known regular user, handy to test what a non-admin can do
    { name: "Anna & Ben", email: "couple@example.com", isAdmin: false, folder: "Anna & Ben" },
    ...OTHER_USERS.map((user) => ({ ...user, isAdmin: false })),
  ];

  let imageIndex = 0;
  const createdPhotoIds: number[] = [];

  for (const [accountIndex, account] of accounts.entries()) {
    const [user] = await db
      .insert(users)
      .values({ name: account.name, email: account.email, password, isAdmin: account.isAdmin })
      .returning();

    const [folder] = await db
      .insert(weddingFolders)
      .values({
        userId: user.id,
        name: account.folder,
        notes: FOLDER_NOTES[accountIndex % FOLDER_NOTES.length],
        weddingDate: accountIndex % 3 === 2 ? null : `2027-0${(accountIndex % 9) + 1}-1${accountIndex}`,
      })
      .returning();

    // 3 to 4 photos per couple, in their folder, the same way an upload does
    const photoCount = accountIndex % 2 === 0 ? 4 : 3;
    for (let i = 0; i < photoCount; i++) {
      const image = SAMPLE_IMAGES[imageIndex % SAMPLE_IMAGES.length];
      const [photo] = await db
        .insert(photos)
        .values({
          userId: user.id,
          title: image.title,
          description: DESCRIPTIONS[imageIndex % DESCRIPTIONS.length],
          category: image.category,
          imagePath: `/images/seed/${image.file}`,
          // Spread the upload times, so "newest first" has a stable order
          createdAt: new Date(Date.UTC(2026, 9, 1, 12, imageIndex)),
        })
        .returning({ id: photos.id });

      await db.insert(folderPhoto).values({ folderId: folder.id, photoId: photo.id });
      createdPhotoIds.push(photo.id);
      imageIndex++;
    }
  }

  // A few subcategories, each with some of the photos sorted into it
  const createdSubcategories = await db
    .insert(subcategories)
    .values([{ name: "Boho" }, { name: "Golden hour" }, { name: "Romantic" }, { name: "Rustic" }])
    .returning();

  for (const [index, photoId] of createdPhotoIds.entries()) {
    if (index % 2 === 0) {
      const subcategory = createdSubcategories[(index / 2) % createdSubcategories.length];
      await db.update(photos).set({ subcategoryId: subcategory.id }).where(eq(photos.id, photoId));
    }
  }
}
