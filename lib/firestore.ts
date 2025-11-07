import { collection, addDoc, serverTimestamp, getDocs, writeBatch, limit, query, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { PILLAR_ARTICLES } from '../constants';
import { Article } from '../types';

/**
 * Adds a new comment document to Firestore.
 * @param articleId The ID of the article being commented on.
 * @param author The name of the commenter.
 * @param content The content of the comment.
 * @param avatarUrl Optional avatar URL from Google account.
 */
export const addComment = async (articleId: string, author: string, content: string, avatarUrl?: string) => {
  const database = db();
  if (!database) {
    throw new Error("Firebase is not initialized. Cannot add comment.");
  }
  
  try {
    await addDoc(collection(database, 'comments'), {
      articleId,
      author,
      content,
      ...(avatarUrl && { avatarUrl }),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding comment to Firestore:", error);
    throw new Error("Could not post comment. Please try again later.");
  }
};

/**
 * Adds a new article document to Firestore.
 * @param articleData The article data to be saved.
 */
export const addArticle = async (articleData: Omit<Article, 'id' | 'publishDate'>) => {
  const database = db();
  if (!database) {
    throw new Error("Firebase is not initialized. Cannot add article.");
  }
  
  try {
    await addDoc(collection(database, 'articles'), {
      ...articleData,
      publishDate: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding article to Firestore:", error);
    throw new Error("Could not publish article. Please try again later.");
  }
};

/**
 * Updates an existing article document in Firestore.
 * Note: This function preserves the author information - it does not update the author field.
 * @param articleId The ID of the article to update.
 * @param articleData The article data to update.
 */
export const updateArticle = async (articleId: string, articleData: Partial<Omit<Article, 'id' | 'publishDate' | 'author'>>) => {
  const database = db();
  if (!database) {
    throw new Error("Firebase is not initialized. Cannot update article.");
  }
  
  try {
    const articleRef = doc(database, 'articles', articleId);
    // Remove author from update data to preserve original author info
    const { author, ...dataToUpdate } = articleData as any;
    await updateDoc(articleRef, dataToUpdate);
  } catch (error) {
    console.error("Error updating article in Firestore:", error);
    throw new Error("Could not update article. Please try again later.");
  }
};

/**
 * Migrates old articles that have "AI Contributor" as author to use the current user's info.
 * This should be called once to update existing articles.
 * @param userDisplayName The display name from Google account
 * @param userPhotoURL The photo URL from Google account
 */
export const migrateOldArticles = async (userDisplayName: string, userPhotoURL: string) => {
  const database = db();
  if (!database) {
    throw new Error("Firebase is not initialized. Cannot migrate articles.");
  }

  try {
    const articlesCollection = collection(database, 'articles');
    const snapshot = await getDocs(articlesCollection);
    
    const batch = writeBatch(database);
    let updateCount = 0;

    snapshot.docs.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      // Check if author is "AI Contributor" or has the old random avatar
      if (data.author?.name === 'AI Contributor' || 
          data.author?.avatarUrl === 'https://i.pravatar.cc/150?u=aicontributor' ||
          !data.author?.name ||
          !data.author?.avatarUrl) {
        const articleRef = doc(database, 'articles', docSnapshot.id);
        batch.update(articleRef, {
          author: {
            name: userDisplayName,
            avatarUrl: userPhotoURL,
          }
        });
        updateCount++;
      }
    });

    if (updateCount > 0) {
      await batch.commit();
      console.log(`Successfully migrated ${updateCount} article(s) to use your account info.`);
      return updateCount;
    } else {
      console.log('No articles need migration.');
      return 0;
    }
  } catch (error) {
    console.error("Error migrating articles:", error);
    throw new Error("Could not migrate articles. Please try again later.");
  }
};

/**
 * Deletes an article document from Firestore.
 * @param articleId The ID of the article to delete.
 */
export const deleteArticle = async (articleId: string) => {
  const database = db();
  if (!database) {
    throw new Error("Firebase is not initialized. Cannot delete article.");
  }
  
  try {
    const articleRef = doc(database, 'articles', articleId);
    await deleteDoc(articleRef);
  } catch (error) {
    console.error("Error deleting article from Firestore:", error);
    throw new Error("Could not delete article. Please try again later.");
  }
};

/**
 * Checks if the 'articles' collection is empty and, if so, populates it
 * with the initial set of pillar articles from constants.ts.
 * This is designed to run once to seed the database.
 */
export const seedInitialArticles = async () => {
    const database = db();
    if (!database) {
        console.warn("Firebase not initialized, skipping article seeding.");
        return;
    }

    // Check if articles collection is empty
    const articlesCollection = collection(database, 'articles');
    const q = query(articlesCollection, limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        console.log("No articles found. Seeding initial pillar articles...");
        try {
            const batch = writeBatch(database);
            PILLAR_ARTICLES.forEach(async article => {
                const docRef = addDoc(articlesCollection, article); // Firestore will auto-generate an ID
                // Note: The batch write doesn't support serverTimestamp directly in this manner.
                // The provided dates in constants.ts will be used.
                // For new articles via addArticle, serverTimestamp is used.
                batch.set((await docRef).withConverter(null), article); // Use a temporary ref for batch
            });
            await batch.commit();
            console.log("Initial articles seeded successfully!");
        } catch (error) {
            console.error("Error seeding articles:", error);
        }
    } else {
        console.log("Articles collection already contains data. Skipping seed.");
    }
};
