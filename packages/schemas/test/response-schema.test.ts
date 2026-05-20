import { buildResponseSchema, FormField } from "../src/index.js";

const fields: FormField[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    order: 0,
    type: "email",
    label: "Email",
    required: true,
    config: {},
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    order: 1,
    type: "number",
    label: "Budget",
    required: true,
    config: { min: 10, max: 100 },
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    order: 2,
    type: "single_select",
    label: "Plan",
    required: true,
    config: {
      options: [
        { value: "hobby", label: "Hobby" },
        { value: "pro", label: "Pro" },
      ],
    },
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    order: 3,
    type: "multi_select",
    label: "Channels",
    required: false,
    config: {
      options: [
        { value: "email", label: "Email" },
        { value: "social", label: "Social" },
      ],
      minSelected: 1,
      maxSelected: 2,
    },
  },
  {
    id: "55555555-5555-4555-8555-555555555555",
    order: 4,
    type: "rating",
    label: "Rating",
    required: true,
    config: { scale: 5, icon: "star" },
  },
];

const schema = buildResponseSchema(fields);

const valid = schema.safeParse({
  "11111111-1111-4111-8111-111111111111": "demo@mysticform.app",
  "22222222-2222-4222-8222-222222222222": 42,
  "33333333-3333-4333-8333-333333333333": "pro",
  "44444444-4444-4444-8444-444444444444": ["email"],
  "55555555-5555-4555-8555-555555555555": 4,
});

if (!valid.success) {
  throw new Error(`Expected valid response fixture: ${valid.error.message}`);
}

const invalidCases = [
  {
    name: "missing required",
    value: {
      "22222222-2222-4222-8222-222222222222": 42,
      "33333333-3333-4333-8333-333333333333": "pro",
      "55555555-5555-4555-8555-555555555555": 4,
    },
  },
  {
    name: "wrong type",
    value: {
      "11111111-1111-4111-8111-111111111111": "demo@mysticform.app",
      "22222222-2222-4222-8222-222222222222": "42",
      "33333333-3333-4333-8333-333333333333": "pro",
      "55555555-5555-4555-8555-555555555555": 4,
    },
  },
  {
    name: "out of range",
    value: {
      "11111111-1111-4111-8111-111111111111": "demo@mysticform.app",
      "22222222-2222-4222-8222-222222222222": 500,
      "33333333-3333-4333-8333-333333333333": "pro",
      "55555555-5555-4555-8555-555555555555": 4,
    },
  },
  {
    name: "invalid option",
    value: {
      "11111111-1111-4111-8111-111111111111": "demo@mysticform.app",
      "22222222-2222-4222-8222-222222222222": 42,
      "33333333-3333-4333-8333-333333333333": "enterprise",
      "55555555-5555-4555-8555-555555555555": 4,
    },
  },
];

for (const invalidCase of invalidCases) {
  if (schema.safeParse(invalidCase.value).success) {
    throw new Error(`Expected invalid response fixture to fail: ${invalidCase.name}`);
  }
}
