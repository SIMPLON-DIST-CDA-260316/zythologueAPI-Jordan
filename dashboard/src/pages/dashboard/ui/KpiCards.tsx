import { formatGrade } from "@/shared/lib/format";
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import type { Stats } from "../model/types";

export function KpiCards({ totals }: { totals: Stats["totals"] }) {
  const kpis = [
    { label: "Bières", value: totals.beers },
    { label: "Brasseries", value: totals.breweries },
    { label: "Avis", value: totals.reviews },
    {
      label: "Note moyenne",
      value:
        totals.averageGrade === null ? "—" : formatGrade(totals.averageGrade),
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.label}>
          <CardHeader>
            <CardDescription>{kpi.label}</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{kpi.value}</CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
