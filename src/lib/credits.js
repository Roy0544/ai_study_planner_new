// Shared constants — safe to import in both server and client components

export const CREDIT_PACKAGES = [
  { id: "starter",  credits: 50,  priceINR: 49,  label: "Starter Pack"  },
  { id: "popular",  credits: 150, priceINR: 129, label: "Popular Pack"  },
  { id: "pro",      credits: 400, priceINR: 299, label: "Pro Pack"       },
];

export const CREDIT_COSTS = {
  study_set:  5,
  mindmap:    2,
  flashcards: 2,
  quiz:       3,
};
