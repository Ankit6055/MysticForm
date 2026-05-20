import {
  and,
  count,
  db,
  desc,
  eq,
  gt,
  ilike,
  isNull,
  lt,
  or,
  sql,
  type SQL,
} from "@repo/database";
import { formsTable, responsesTable, themesTable, usersTable } from "@repo/database/schema";

type ExploreInput = {
  limit: number;
  cursor?: string;
};

type ExploreByThemeInput = ExploreInput & {
  themeSlug: string;
};

type ExploreSearchInput = ExploreInput & {
  q: string;
};

function encodeCursor(row: { publishedAt: Date | null; id: string }) {
  return Buffer.from(
    JSON.stringify({ publishedAt: row.publishedAt?.toISOString() ?? "", id: row.id }),
  ).toString("base64url");
}

function decodeCursor(cursor: string) {
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as {
      publishedAt?: string;
      id?: string;
    };
    if (!parsed.publishedAt || !parsed.id) return null;
    return { publishedAt: new Date(parsed.publishedAt), id: parsed.id };
  } catch {
    return null;
  }
}

class ExploreService {
  public async featured(input: ExploreInput) {
    return this.listPublicForms(input);
  }

  public async byTheme(input: ExploreByThemeInput) {
    return this.listPublicForms(input, eq(themesTable.slug, input.themeSlug));
  }

  public async search(input: ExploreSearchInput) {
    return this.listPublicForms(
      input,
      or(ilike(formsTable.title, `%${input.q}%`), ilike(formsTable.description, `%${input.q}%`)),
    );
  }

  private async listPublicForms(input: ExploreInput, extraFilter?: SQL) {
    const cursor = input.cursor ? decodeCursor(input.cursor) : null;
    const responseCount = count(responsesTable.id);
    const filters = [
      eq(formsTable.visibility, "public"),
      eq(formsTable.status, "active"),
      or(isNull(formsTable.expiresAt), gt(formsTable.expiresAt, new Date())),
      cursor
        ? or(
            lt(formsTable.publishedAt, cursor.publishedAt),
            and(eq(formsTable.publishedAt, cursor.publishedAt), lt(formsTable.id, cursor.id)),
          )
        : undefined,
      extraFilter,
    ].filter(Boolean);

    const rows = await db
      .select({
        id: formsTable.id,
        slug: formsTable.slug,
        title: formsTable.title,
        description: formsTable.description,
        coverEmoji: formsTable.coverEmoji,
        publishedAt: formsTable.publishedAt,
        responseLimit: formsTable.responseLimit,
        responseCount,
        creatorName: usersTable.fullName,
        theme: {
          slug: themesTable.slug,
          tokens: themesTable.tokens,
        },
      })
      .from(formsTable)
      .innerJoin(usersTable, eq(usersTable.id, formsTable.ownerId))
      .leftJoin(themesTable, eq(themesTable.id, formsTable.themeId))
      .leftJoin(responsesTable, eq(responsesTable.formId, formsTable.id))
      .where(and(...filters))
      .groupBy(formsTable.id, usersTable.id, themesTable.id)
      .having(or(isNull(formsTable.responseLimit), sql`${responseCount} < ${formsTable.responseLimit}`))
      .orderBy(desc(formsTable.publishedAt), desc(formsTable.id))
      .limit(input.limit + 1);

    const items = rows.slice(0, input.limit).map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      description: row.description,
      coverEmoji: row.coverEmoji,
      theme: row.theme?.slug ? row.theme : null,
      responseCount: row.responseCount,
      creatorName: row.creatorName,
    }));

    return {
      items,
      nextCursor: rows.length > input.limit ? encodeCursor(rows[input.limit]!) : null,
    };
  }
}

export default ExploreService;
