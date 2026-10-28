type DetailItemProps = {
  label: string;
  children: React.ReactNode;
};

// Paire libellé / valeur des pages détail, à placer dans un <dl>
export function DetailItem({ label, children }: DetailItemProps) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{children}</dd>
    </div>
  );
}
