// Formats d'affichage partagés par les tableaux et les pages détail
const euro = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});
const decimal = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

export const formatPrice = (price: number) => euro.format(price);

export const formatAlcoholLevel = (alcoholLevel: number) =>
  `${decimal.format(alcoholLevel)} %`;
