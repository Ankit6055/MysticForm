type ThemeTile = {
  slug: string;
  title: string;
  description: string | null;
  coverEmoji: string | null;
  theme: {
    slug: string;
    tokens: {
      background: string;
      foreground: string;
      accent: string;
      accentForeground: string;
      muted: string;
      font: string;
      radius: string;
    };
  } | null;
};

const fallbackTiles: ThemeTile[] = [
  {
    slug: "anime-launch",
    title: "Anime launch party",
    description: "RSVPs with neon softness.",
    coverEmoji: "✨",
    theme: {
      slug: "anime",
      tokens: {
        background: "#fff7fb",
        foreground: "#1f1020",
        accent: "#e255a1",
        accentForeground: "#ffffff",
        muted: "#f3ddec",
        font: "Geist",
        radius: "12px",
      },
    },
  },
  {
    slug: "movie-night",
    title: "Movie night ballot",
    description: "Noir voting for communities.",
    coverEmoji: "🎬",
    theme: {
      slug: "cinema",
      tokens: {
        background: "#111111",
        foreground: "#eef4ef",
        accent: "#f4c95d",
        accentForeground: "#111111",
        muted: "#2d2a24",
        font: "Geist",
        radius: "8px",
      },
    },
  },
  {
    slug: "retro-os",
    title: "Retro OS feedback",
    description: "Sharp-edged product feedback.",
    coverEmoji: "💾",
    theme: {
      slug: "os",
      tokens: {
        background: "#e7f7f0",
        foreground: "#10221d",
        accent: "#1f7a63",
        accentForeground: "#ffffff",
        muted: "#cfe9df",
        font: "Geist",
        radius: "4px",
      },
    },
  },
  {
    slug: "founder-fit",
    title: "Founder fit survey",
    description: "Warm venture intake.",
    coverEmoji: "🚀",
    theme: {
      slug: "startup",
      tokens: {
        background: "#fff7df",
        foreground: "#24190a",
        accent: "#d97706",
        accentForeground: "#ffffff",
        muted: "#f1dfb4",
        font: "Geist",
        radius: "10px",
      },
    },
  },
];

export function ThemeShowcase({ forms }: { forms: ThemeTile[] }) {
  const tiles = forms.length > 0 ? forms.slice(0, 4) : fallbackTiles;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#9b6f2d] dark:text-[#f4c95d]">
            Theme gallery
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Forms can have a point of view.
          </h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-muted-foreground">
          This section pulls public forms from the explore API when seeded data is available.
        </p>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((form) => {
          const tokens = form.theme?.tokens ?? fallbackTiles[0]!.theme!.tokens;
          return (
            <article
              key={form.slug}
              className="min-h-[220px] rounded-md border p-5 shadow-sm"
              style={{
                background: tokens.background,
                color: tokens.foreground,
                borderColor: tokens.muted,
                borderRadius: tokens.radius,
              }}
            >
              <div
                className="mb-10 flex size-12 items-center justify-center rounded-md text-2xl"
                style={{ background: tokens.accent, color: tokens.accentForeground }}
              >
                {form.coverEmoji ?? "✦"}
              </div>
              <h3 className="text-lg font-semibold">{form.title}</h3>
              <p className="mt-2 text-sm opacity-75">{form.description ?? "Ready to publish and share."}</p>
              <div className="mt-6 h-2 w-20 rounded-full" style={{ background: tokens.accent }} />
            </article>
          );
        })}
      </div>
    </section>
  );
}
