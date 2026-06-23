// Shared constants — safe to import in both server and client components

export const CREDIT_PACKAGES = [
  { id: "starter",  credits: 490,  priceINR: 49,  label: "Starter Pack"  },
  { id: "popular",  credits: 1500, priceINR: 129, label: "Popular Pack"  },
  { id: "pro",      credits: 3750, priceINR: 299, label: "Pro Pack"       },
];

export const CREDIT_COSTS = {
  study_set:  150,
  mindmap:    5,
  flashcards: 6,
  quiz:       8,
};
