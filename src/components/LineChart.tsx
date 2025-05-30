// 'use client';

import { Card, LineChart, List, ListItem } from "@tremor/react";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const data = [
  {
    date: "Jan 23",
    Monterrey: 2340,
    Chiapas: 22320,
    Cancun: 12410,
  },
  {
    date: "Feb 23",
    Monterrey: 50120,
    Chiapas: 32310,
    Cancun: 10300,
  },
  {
    date: "Mar 23",
    Monterrey: 45190,
    Chiapas: 23450,
    Cancun: 10900,
  },
  {
    date: "Apr 23",
    Monterrey: 56420,
    Chiapas: 13400,
    Cancun: 7900,
  },
  {
    date: "May 23",
    Monterrey: 40420,
    Chiapas: 16400,
    Cancun: 12310,
  },
  {
    date: "Jun 23",
    Monterrey: 47010,
    Chiapas: 18350,
    Cancun: 10250,
  },
  {
    date: "Jul 23",
    Monterrey: 47490,
    Chiapas: 19950,
    Cancun: 12650,
  },
  {
    date: "Aug 23",
    Monterrey: 39610,
    Chiapas: 10910,
    Cancun: 4650,
  },
  {
    date: "Sep 23",
    Monterrey: 45860,
    Chiapas: 24740,
    Cancun: 12650,
  },
  {
    date: "Oct 23",
    Monterrey: 50910,
    Chiapas: 15740,
    Cancun: 10430,
  },
  {
    date: "Nov 23",
    Monterrey: 4919,
    Chiapas: 2874,
    Cancun: 2081,
  },
  {
    date: "Dec 23",
    Monterrey: 5519,
    Chiapas: 2274,
    Cancun: 1479,
  },
];

const summary = [
  {
    location: "Monterrey",
    address: "San Pedro Garza",
    color: "bg-blue-500",
    type: "Gasto por noche",
    total: "$460.2K",
    change: "+0.7%",
    changeType: "positive",
  },
  {
    location: "Chiapas",
    address: "",
    color: "bg-cyan-500",
    type: "Gasto por noche",
    total: "$237.3K",
    change: "-1.2%",
    changeType: "negative",
  },
  {
    location: "Cancun",
    address: "Quintana roo",
    color: "bg-sky-500",
    type: "Gasto por noche",
    total: "$118.2K",
    change: "+4.6%",
    changeType: "positive",
  },
];

const currencyFormatter = (number: number) =>
  `$${Intl.NumberFormat("us").format(number).toString()}`;

export function ChartLine() {
  return (
    <>
      <Card className="sm:mx-auto">
        <h4 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
          Gastos por noche
        </h4>
        <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          $815,700
        </p>
        <LineChart
          data={data}
          index="date"
          categories={["Monterrey", "Chiapas", "Cancun"]}
          showLegend={false}
          showYAxis={false}
          valueFormatter={currencyFormatter}
          className="mt-5 hidden h-44 sm:block"
        />
        <LineChart
          data={data}
          index="date"
          categories={["Monterrey", "Chiapas", "Cancun"]}
          showLegend={false}
          startEndOnly={true}
          showYAxis={false}
          valueFormatter={currencyFormatter}
          className="mt-5 h-44 sm:hidden"
        />
        <List className="mt-4">
          {summary.map((item) => (
            <ListItem key={item.location}>
              <div>
                <div className="flex items-center space-x-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={classNames(item.color, "size-2.5 rounded-sm")}
                      aria-hidden={true}
                    />
                    <p className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                      {item.location}
                    </p>
                  </div>
                  <span className="rounded bg-tremor-background-subtle px-1.5 py-0.5 text-tremor-label font-medium text-tremor-content dark:bg-dark-tremor-background-subtle dark:text-dark-tremor-content">
                    {item.type}
                  </span>
                </div>
                <span className="text-tremor-label text-tremor-content dark:text-dark-tremor-content">
                  {item.address}
                </span>
              </div>
              <div className="text-right">
                <p
                  className={classNames(
                    item.changeType === "positive"
                      ? "text-emerald-700 dark:text-emerald-500"
                      : "text-red-700 dark:text-red-500",
                    "text-tremor-default font-medium"
                  )}
                >
                  {item.change}
                </p>
                <span className="text-tremor-label text-tremor-content">
                  {item.total}
                </span>
              </div>
            </ListItem>
          ))}
        </List>
      </Card>
    </>
  );
}
