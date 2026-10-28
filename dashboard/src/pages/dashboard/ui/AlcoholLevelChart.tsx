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
import { Bar, BarChart, LabelList, XAxis } from "recharts";
import type { Stats } from "../model/types";

const chartConfig = { count: { label: "Bières" } } satisfies ChartConfig;

export function AlcoholLevelChart({
  data,
}: {
  data: Stats["beersByAlcoholLevel"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Répartition par degré</CardTitle>
        <CardDescription>Nombre de bières par tranche d'alcool</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-64 w-full"
        >
          <BarChart data={data} margin={{ top: 24 }}>
            <XAxis
              dataKey="range"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="var(--chart-2)" radius={4}>
              <LabelList
                dataKey="count"
                position="top"
                className="fill-foreground"
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
