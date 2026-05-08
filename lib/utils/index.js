export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatCurrency(amount) {
  return `Rs. ${amount.toLocaleString("en-US")}`;
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
