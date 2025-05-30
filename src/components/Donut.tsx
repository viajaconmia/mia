// 'use client';

import { RiArrowRightSLine } from "@remixicon/react";
import {
  Card,
  DonutChart,
  List,
  ListItem,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@tremor/react";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const currencyFormatter = (number: number, simbol: string = "") => {
  return `${simbol}` + Intl.NumberFormat("us").format(number).toString();
};

export default function Donut({
  summary,
  titulo,
  subtitulo,
  simbol = "",
}: {
  summary: {
    name: string;
    data: { name: string; amount: number; href: string; borderColor: string }[];
  }[];
  titulo: string;
  subtitulo: string;
  simbol: string;
}) {
  return (
    <>
      <Card className="overflow-hidden p-0 sm:mx-auto sm:max-w-lg">
        <div className="px-6 pt-6">
          <h3 className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
            {titulo}
          </h3>
          <p className="mt-1 text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
            {subtitulo}
          </p>
        </div>
        <TabGroup>
          <TabList className="px-6 pt-4">
            {summary.map((category) => (
              <Tab key={category.name}>By {category.name}</Tab>
            ))}
          </TabList>
          <TabPanels className="mt-8">
            {summary.map((category) => (
              <TabPanel key={category.name}>
                <div className="px-6 pb-6">
                  <DonutChart
                    data={category.data}
                    category="amount"
                    index="name"
                    valueFormatter={(number: number) =>
                      currencyFormatter(number, simbol)
                    }
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
                      <div
                        className={classNames(
                          item.borderColor,
                          "flex h-12 w-full items-center truncate border-l-2 pl-4"
                        )}
                      >
                        <span className="truncate group-hover:text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis group-hover:dark:text-dark-tremor-content-strong">
                          <a href={item.href} className="focus:outline-none">
                            {/* extend link to entire list item */}
                            <span
                              className="absolute inset-0"
                              aria-hidden={true}
                            />
                            {item.name}
                          </a>
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-medium tabular-nums text-tremor-content-strong dark:text-dark-tremor-content-strong">
                          {currencyFormatter(item.amount, simbol)}{" "}
                          <span className="font-normal text-tremor-content dark:text-dark-tremor-content">
                            {/* ({item.share}) */}
                          </span>
                        </span>
                      </div>
                    </ListItem>
                  ))}
                </List>
              </TabPanel>
            ))}
          </TabPanels>
        </TabGroup>
      </Card>
    </>
  );
}
