import { prisma } from "~/lib/auth";

export default defineEventHandler(async (event) => {
  if (event.method === "GET") {
    try {
      const tags = await prisma.tags.findMany();
      return tags;
    } catch (error) {
      console.error("Ошибка при получении тегов:", error);
      return [];
    }
  }
});
