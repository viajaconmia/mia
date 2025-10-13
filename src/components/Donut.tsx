import { Card, DonutChart, List, ListItem } from "@tremor/react";

// Helper: redondeo numérico seguro a 2 decimales
const round2 = (n: number) =>
  Math.round((Number(n) + Number.EPSILON) * 100) / 100;

// Formateador para mostrar SIEMPRE 2 decimales
const currencyFormatter = (number: number, simbol: string = "") => {
  const n = Number.isFinite(number) ? number : 0;
  return `${simbol}${new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)}`;
};

export default function Donut({
  summary,
  titulo,
  simbol = "",
}: {
  summary: {
    name: string;
    data: { name: string; amount: number; href: string }[];
  }[];
  titulo: string;
  subtitulo: string;
  simbol: string;
}) {
  return (
    <Card className="overflow-hidden p-0 sm:mx-auto sm:max-w-lg">
      <div className="p-3 border-b">
        <h3 className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
          {titulo}
        </h3>
      </div>

      {summary.map((category) => (
        <div key={category.name}>
          <div className="p-6">
            <DonutChart
              // ⚠️ Asegúrate de que los amounts ya vengan redondeados a 2 decimales.
              // Si quieres forzarlo aquí, puedes mapear:
              data={category.data.map(d => ({ ...d, amount: round2(d.amount) }))}
              category="amount"
              index="name"
              // ✅ Esto controla cómo se muestran los valores (tooltip/leyenda/labels según Tremor)
              valueFormatter={(value: number) => currencyFormatter(round2(value), simbol)}
              showTooltip={false}
              colors={["blue", "indigo", "cyan", "purple", "fuchsia"]}
            />
          </div>

          <List className="mt-2 border-t border-tremor-border dark:border-dark-tremor-border">
            {category.data.map((item) => (
              <ListItem
                key={item.name}
                className="group relative space-x-4 truncate !py-0 !pr-4 hover:bg-tremor-background-muted hover:dark:bg-dark-tremor-background-muted"
              >
                <div className="flex h-12 w-full items-center truncate border-l-2 pl-4">
                  <span className="truncate group-hover:text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis group-hover:dark:text-dark-tremor-content-strong">
                    <a href={item.href} className="focus:outline-none">
                      <span className="absolute inset-0" aria-hidden={true} />
                      {item.name}
                    </a>
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className="font-medium tabular-nums text-tremor-content-strong dark:text-dark-tremor-content-strong">
                    {currencyFormatter(round2(item.amount), simbol)}
                  </span>
                </div>
              </ListItem>
            ))}
          </List>
        </div>
      ))}
    </Card>
  );
}
