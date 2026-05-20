import { asc, db, eq } from "@repo/database";
import { themesTable } from "@repo/database/schema";

export class ThemeServiceError extends Error {
  constructor(
    public readonly code: "NOT_FOUND",
    message: string,
  ) {
    super(message);
  }
}

class ThemeService {
  public async list() {
    return db.select().from(themesTable).orderBy(asc(themesTable.name));
  }

  public async get(slug: string) {
    const [theme] = await db.select().from(themesTable).where(eq(themesTable.slug, slug)).limit(1);
    if (!theme) throw new ThemeServiceError("NOT_FOUND", "Theme not found");
    return theme;
  }
}

export default ThemeService;
