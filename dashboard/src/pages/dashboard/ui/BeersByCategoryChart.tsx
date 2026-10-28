import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/ui/chart";
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
import type { Stats } from "../model/types";

// Sans color dans la config : ChartStyle n'injecte pas de <style>
const chartConfig = { count: { label: "Bières" } } satisfies ChartConfig;

export function BeersByCategoryChart({
  data,
}: {
  data: Stats["beersByCategory"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bières par catégorie</CardTitle>
        <CardDescription>
          Une bière peut appartenir à plusieurs catégories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto w-full"
          // Hauteur proportionnelle au nombre de barres
          style={{ height: Math.max(data.length * 32, 120) }}
        >
          <BarChart data={data} layout="vertical" margin={{ right: 32 }}>
            <XAxis type="number" dataKey="count" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={120}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            {/* --chart-2 : contraste ≥ 3:1 sur la carte dans les deux thèmes */}
            <Bar dataKey="count" fill="var(--chart-2)" radius={4}>
              <LabelList
                dataKey="count"
                position="right"
                className="fill-foreground"
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
