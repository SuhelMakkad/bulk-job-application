export const waitFor = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
