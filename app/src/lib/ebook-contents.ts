/**
 * "What's inside" on the /ebook page: the chapters of Desi Weightloss Recipes (from the book's
 * contents pages, docs/assets/client-supplied/desi-weightloss-recipes-v3.pdf) with a few
 * highlight recipes each. No total recipe count on purpose (the owner asked for that).
 */
export type EbookChapter = { title: string; note: string; icon: "sun" | "utensils" | "sparkle" | "leaf" | "heart" | "star" | "droplet"; highlights: string[] };

export const EBOOK_CHAPTERS: EbookChapter[] = [
  { title: "Breakfast", note: "About 400 kcal for the morning", icon: "sun", highlights: ["Besan Chilla with Mint Chutney", "Shami Kabab with Multigrain Bread", "Low-Calorie Stuffed Methi Paratha", "Oats Smoothie"] },
  { title: "Lunch", note: "About 400 kcal, real desi plates", icon: "utensils", highlights: ["Daal Chawal", "Chicken Karahi with Roti", "Mutton Shinwari with Roti", "Chapli Seekh Kabab with Pita"] },
  { title: "Protein-Rich Cheelas", note: "300-340 kcal per serving", icon: "sparkle", highlights: ["Moong Dal Cheela with Mint Yogurt", "Paneer Stuffed Besan Cheela", "Chicken Stuffed Cheela"] },
  { title: "Vegetarian Dinner", note: "About 400 kcal, full of fibre", icon: "leaf", highlights: ["Bhindi with Roti", "Dal Karela with Roti", "Paneer Bhurji with Roti", "Rajma Rice"] },
  { title: "Non-Vegetarian Dinner", note: "About 400 kcal, high protein", icon: "heart", highlights: ["Low-Calorie Chicken Biryani", "Air-Fried Pepperoni Pizza", "Chicken Shawarma Wrap"] },
  { title: "Healthy Snacks", note: "100-180 kcal each", icon: "star", highlights: ["Roasted Chickpea Chaat", "Roasted Makhana", "Chicken Tikka Bites"] },
  { title: "Detox Waters", note: "5-18 kcal per litre", icon: "droplet", highlights: ["Lemon & Mint", "Cucumber & Lemon", "Watermelon & Basil"] },
];

/** The guides at the start and end of the book. */
export const EBOOK_GUIDES = ["How to use this book", "Portion size guide", "Protein portion guide", "Your desi pantry", "Multigrain atta", "A sample week of meals"];
