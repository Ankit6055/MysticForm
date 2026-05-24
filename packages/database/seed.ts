import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { db } from "./index";
import {
  formFieldsTable,
  formsTable,
  responsesTable,
  themesTable,
  usersTable,
  type FieldConfig,
} from "./schema";

const demoEmail = process.env.NEXT_PUBLIC_DEMO_EMAIL || "demo@mysticform.app";
const demoPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD || "mysticform-demo-2026";

const themes = [
  {
    name: "Aurora Desk",
    slug: "aurora-desk",
    description: "Warm editorial forms with a polished SaaS feel.",
    tokens: {
      background: "#f7f3e8",
      foreground: "#171512",
      accent: "#c78918",
      accentForeground: "#fff8e1",
      muted: "#706757",
      font: "geist",
      radius: "14px",
    },
  },
  {
    name: "Noir Ballot",
    slug: "noir-ballot",
    description: "Dark cinematic voting surfaces.",
    tokens: {
      background: "#151515",
      foreground: "#f7f1e7",
      accent: "#e05f3e",
      accentForeground: "#160c08",
      muted: "#b9aa9c",
      font: "geist",
      radius: "10px",
    },
  },
  {
    name: "Moss Studio",
    slug: "moss-studio",
    description: "Calm research intake with natural contrast.",
    tokens: {
      background: "#eef4ef",
      foreground: "#17231d",
      accent: "#1f7a63",
      accentForeground: "#f3fff9",
      muted: "#5d7166",
      font: "geist",
      radius: "16px",
    },
  },
  {
    name: "Pixel Console",
    slug: "pixel-console",
    description: "Retro product feedback with sharp edges.",
    tokens: {
      background: "#10151c",
      foreground: "#e8fff4",
      accent: "#57e389",
      accentForeground: "#07100b",
      muted: "#8aa59a",
      font: "mono",
      radius: "6px",
    },
  },
  {
    name: "Candy Launch",
    slug: "candy-launch",
    description: "Bright creator campaigns and event forms.",
    tokens: {
      background: "#fff0f5",
      foreground: "#2a111d",
      accent: "#e255a1",
      accentForeground: "#fff7fb",
      muted: "#8a5f72",
      font: "geist",
      radius: "20px",
    },
  },
  {
    name: "Indigo Lab",
    slug: "indigo-lab",
    description: "Structured surveys for product teams.",
    tokens: {
      background: "#eff2ff",
      foreground: "#12172a",
      accent: "#3f5ecf",
      accentForeground: "#ffffff",
      muted: "#5b668f",
      font: "geist",
      radius: "12px",
    },
  },
  {
    name: "Signal Lime",
    slug: "signal-lime",
    description: "High-energy forms for growth experiments.",
    tokens: {
      background: "#f6ffe8",
      foreground: "#17200d",
      accent: "#6e9f1c",
      accentForeground: "#fbfff2",
      muted: "#60714f",
      font: "geist",
      radius: "10px",
    },
  },
  {
    name: "Slate Clinic",
    slug: "slate-clinic",
    description: "Quiet operational forms for teams.",
    tokens: {
      background: "#f3f5f7",
      foreground: "#111827",
      accent: "#334155",
      accentForeground: "#ffffff",
      muted: "#64748b",
      font: "geist",
      radius: "8px",
    },
  },
];

type FieldSeed = {
  type:
    | "short_text"
    | "long_text"
    | "email"
    | "number"
    | "single_select"
    | "multi_select"
    | "checkbox"
    | "dropdown"
    | "rating"
    | "date";
  label: string;
  required?: boolean;
  helpText?: string;
  config?: FieldConfig;
};

type FormSeed = {
  title: string;
  slug: string;
  description: string;
  coverEmoji: string;
  themeSlug: string;
  visibility: "public" | "unlisted";
  isTemplate: boolean;
  fields: FieldSeed[];
  responseCount: number;
};

const option = (label: string) => ({
  label,
  value: label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, ""),
});

const formSeeds: FormSeed[] = [
  {
    title: "Founder fit survey",
    slug: "founder-fit-survey",
    description: "Qualify early users, investors, and launch partners before a sprint.",
    coverEmoji: "🚀",
    themeSlug: "aurora-desk",
    visibility: "public",
    isTemplate: true,
    responseCount: 36,
    fields: [
      { type: "short_text", label: "Company name", required: true },
      { type: "email", label: "Best contact email", required: true },
      {
        type: "dropdown",
        label: "Company stage",
        required: true,
        config: { options: ["Idea", "MVP", "Seed", "Series A+"].map(option) },
      },
      { type: "rating", label: "How urgent is this problem?", config: { scale: 5, icon: "star" } },
      { type: "long_text", label: "What would make this a must-have?" },
    ],
  },
  {
    title: "Movie night ballot",
    slug: "movie-night-ballot",
    description: "Let a community vote on the next watch party without a messy chat thread.",
    coverEmoji: "🎬",
    themeSlug: "noir-ballot",
    visibility: "public",
    isTemplate: true,
    responseCount: 42,
    fields: [
      { type: "short_text", label: "Your name", required: true },
      {
        type: "single_select",
        label: "Pick the movie",
        required: true,
        config: {
          options: ["Arrival", "Spirited Away", "Inception", "The Grand Budapest Hotel"].map(
            option,
          ),
        },
      },
      {
        type: "multi_select",
        label: "Snacks you would bring",
        config: { options: ["Popcorn", "Nachos", "Brownies", "Soda"].map(option), maxSelected: 3 },
      },
      { type: "date", label: "Best date" },
    ],
  },
  {
    title: "Retro OS feedback",
    slug: "retro-os-feedback",
    description: "A playful product feedback form for design systems and beta launches.",
    coverEmoji: "💾",
    themeSlug: "pixel-console",
    visibility: "public",
    isTemplate: true,
    responseCount: 34,
    fields: [
      { type: "email", label: "Tester email", required: true },
      {
        type: "rating",
        label: "Overall beta score",
        required: true,
        config: { scale: 5, icon: "star" },
      },
      {
        type: "single_select",
        label: "Most useful area",
        config: { options: ["Builder", "Analytics", "Sharing", "Themes"].map(option) },
      },
      { type: "long_text", label: "What felt rough?" },
    ],
  },
  {
    title: "Anime launch party RSVP",
    slug: "anime-launch-party-rsvp",
    description: "Collect RSVPs, cosplay plans, and food needs for a themed event.",
    coverEmoji: "✨",
    themeSlug: "candy-launch",
    visibility: "public",
    isTemplate: true,
    responseCount: 38,
    fields: [
      { type: "short_text", label: "Display name", required: true },
      { type: "email", label: "Email for updates", required: true },
      { type: "checkbox", label: "I am planning to attend", required: true },
      {
        type: "dropdown",
        label: "Cosplay level",
        config: { options: ["None", "Accessory", "Full outfit", "Surprise reveal"].map(option) },
      },
      { type: "number", label: "Guests joining", config: { min: 0, max: 4, step: 1 } },
    ],
  },
  {
    title: "Customer success pulse",
    slug: "customer-success-pulse",
    description: "A recurring health check for onboarding, sentiment, and expansion signals.",
    coverEmoji: "📈",
    themeSlug: "indigo-lab",
    visibility: "public",
    isTemplate: false,
    responseCount: 32,
    fields: [
      { type: "email", label: "Work email", required: true },
      {
        type: "rating",
        label: "How healthy is your rollout?",
        config: { scale: 10, icon: "star" },
      },
      {
        type: "single_select",
        label: "Current status",
        config: { options: ["On track", "Needs help", "Blocked", "Expanding"].map(option) },
      },
      { type: "long_text", label: "What should our team know?" },
    ],
  },
  {
    title: "Internal team retro",
    slug: "internal-team-retro",
    description: "A private retro link for teams that should never appear in Explore.",
    coverEmoji: "🧭",
    themeSlug: "slate-clinic",
    visibility: "unlisted",
    isTemplate: false,
    responseCount: 18,
    fields: [
      { type: "short_text", label: "Team", required: true },
      { type: "rating", label: "Sprint energy", config: { scale: 5, icon: "heart" } },
      { type: "long_text", label: "What should we keep doing?" },
      { type: "long_text", label: "What should change next sprint?" },
    ],
  },
];

function pick<T>(items: T[], index: number) {
  return items[index % items.length]!;
}

function answerFor(field: FieldSeed & { id: string }, index: number, formSlug: string) {
  const phrases = [
    "The flow was clear and fast.",
    "I liked the theme and the short questions.",
    "The analytics view would help our weekly review.",
    "The publish options were easy to understand.",
  ];

  if (field.type === "email") return `${formSlug}.${index + 1}@example.com`;
  if (field.type === "short_text")
    return pick(["Northstar Labs", "Ava Chen", "Studio Nine", "Launch Ops"], index);
  if (field.type === "long_text") return pick(phrases, index);
  if (field.type === "number") return index % 5;
  if (field.type === "checkbox") return index % 6 !== 0;
  if (field.type === "date") {
    const date = new Date(Date.UTC(2026, 4, 20 + (index % 20)));
    return date.toISOString().slice(0, 10);
  }
  if (field.type === "rating") {
    const scale = (field.config?.scale as number | undefined) ?? 5;
    return Math.max(1, Math.min(scale, scale - (index % 5 === 0 ? 2 : index % 3 === 0 ? 1 : 0)));
  }

  const options = (field.config?.options as Array<{ value: string }> | undefined) ?? [];
  if (field.type === "multi_select") {
    return options.slice(0, (index % Math.min(3, options.length)) + 1).map((item) => item.value);
  }

  return pick(options, index)?.value;
}

async function upsertThemes() {
  const rows = [];
  for (const theme of themes) {
    const [row] = await db
      .insert(themesTable)
      .values(theme)
      .onConflictDoUpdate({
        target: themesTable.slug,
        set: {
          name: theme.name,
          description: theme.description,
          tokens: theme.tokens,
          isBuiltIn: true,
        },
      })
      .returning();
    rows.push(row!);
  }
  return new Map(rows.map((row) => [row.slug, row]));
}

async function upsertDemoUser() {
  const passwordHash = await bcrypt.hash(demoPassword, 10);
  const [user] = await db
    .insert(usersTable)
    .values({
      fullName: "MysticForm Demo",
      email: demoEmail,
      emailVerified: true,
      passwordHash,
      authProvider: ["password"],
    })
    .onConflictDoUpdate({
      target: usersTable.email,
      set: {
        fullName: "MysticForm Demo",
        emailVerified: true,
        passwordHash,
        authProvider: ["password"],
      },
    })
    .returning();

  return user!;
}

async function upsertForms(ownerId: string, themeBySlug: Awaited<ReturnType<typeof upsertThemes>>) {
  const forms = [];
  for (const seed of formSeeds) {
    const theme = themeBySlug.get(seed.themeSlug);
    const values = {
      ownerId,
      themeId: theme?.id ?? null,
      title: seed.title,
      description: seed.description,
      slug: seed.slug,
      visibility: seed.visibility,
      status: "active" as const,
      coverEmoji: seed.coverEmoji,
      submitLabel: "Submit",
      thankYouMessage: "Thanks - your response is in.",
      isTemplate: seed.isTemplate,
      publishedAt: new Date("2026-05-20T10:00:00.000Z"),
    };

    const [form] = await db
      .insert(formsTable)
      .values(values)
      .onConflictDoUpdate({
        target: formsTable.slug,
        set: values,
      })
      .returning();

    forms.push({ form: form!, seed });
  }
  return forms;
}

async function replaceFieldsAndResponses(forms: Awaited<ReturnType<typeof upsertForms>>) {
  const formIds = forms.map(({ form }) => form.id);
  await db.delete(responsesTable).where(inArray(responsesTable.formId, formIds));
  await db.delete(formFieldsTable).where(inArray(formFieldsTable.formId, formIds));

  for (const { form, seed } of forms) {
    const fields = seed.fields.map((field, order) => ({
      ...field,
      id: randomUUID(),
      formId: form.id,
      order,
      required: field.required ?? false,
      helpText: field.helpText ?? null,
      config: field.config ?? {},
    }));

    await db.insert(formFieldsTable).values(fields);

    const responses = Array.from({ length: seed.responseCount }, (_, index) => {
      const answers = Object.fromEntries(
        fields.map((field) => [field.id, answerFor(field, index, seed.slug)]),
      );
      const createdAt = new Date(Date.UTC(2026, 4, 1 + (index % 22), 9 + (index % 8), index % 60));

      return {
        formId: form.id,
        answers,
        respondentEmail: `${seed.slug}.${index + 1}@example.com`,
        ipHash: `seed-${seed.slug}-${index}`,
        userAgent: "MysticForm seed",
        createdAt,
      };
    });

    await db.insert(responsesTable).values(responses);
  }
}

async function main() {
  const themeBySlug = await upsertThemes();
  const user = await upsertDemoUser();
  const forms = await upsertForms(user.id, themeBySlug);
  await replaceFieldsAndResponses(forms);

  console.log(
    `Seeded ${themes.length} themes, ${forms.length} forms, and ${forms.reduce(
      (total, item) => total + item.seed.responseCount,
      0,
    )} responses for ${demoEmail}.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
