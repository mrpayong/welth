// "use client";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { endOfDay, format, startOfDay, subDays } from "date-fns";
// import React, { useMemo, useState } from "react";
// import {
//   Bar,
//   BarChart,
//   CartesianGrid,
//   Legend,
//   Rectangle,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from "recharts";

// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { CalendarIcon } from "lucide-react";
// import { Calendar } from "@/components/ui/calendar";
// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import { LineChart } from "@mui/x-charts";

// const DATE_RANGES = {
//   "7D": { label: "Last 7 Days", days: 7 },
//   "1M": { label: "Last Month", days: 30 },
//   "3M": { label: "Last 3 Months", days: 90 },
//   "6M": { label: "Last 6 Months", days: 180 },
//   ALL: { label: "All TIme", days: null },
// };

// const AccountChart = ({ transactions }) => {
//   const [dateRange, setDateRange] = useState("1M");

//   const formatAmount = (amount) => {
//     return new Intl.NumberFormat("en-US", {
//       style: "currency",
//       currency: "PHP",
//     }).format(amount);
//   };

//   //   const filteredData = useMemo(() => {
//   //     const range = DATE_RANGES[dateRange];
//   //     const now = new Date();
//   //     const startDate = range.days
//   //       ? startOfDay(subDays(now, range.days))
//   //       : startOfDay(new Date(0));

//   //     // Filter transactions within date range
//   //     const filtered = transactions.filter(
//   //       (t) => new Date(t.date) >= startDate && new Date(t.date) <= endOfDay(now)
//   //     );

//   //     const grouped = filtered.reduce((acc, transactions) => {
//   //       const date = format(new Date(transactions.date), "MMM dd");

//   //       if (!acc[date]) {
//   //         acc[date] = { date, income: 0, expense: 0 };
//   //       }

//   //       if (transactions.type === "INCOME") {
//   //         acc[date].income += transactions.amount;
//   //       } else {
//   //         acc[date].expense += transactions.amount;
//   //       }
//   //       return acc;
//   //     }, {});

//   //     //  convert to array and sort by date
//   //     return Object.values(grouped).sort(
//   //       (a, b) => new Date(a.date) - new Date(b.date)
//   //     );
//   //   }, [transactions, dateRange]);

//   //    const totals = useMemo(() => {
//   //     return filteredData.reduce(
//   //         (acc, day) => ({
//   //             income: acc.income + day.income,
//   //             expense: acc.expense + day.expense,
//   //         }),
//   //         {income: 0, expense: 0}
//   //     );
//   //    }, [filteredData])
//       const formatDate = (dateString) => {
//         const date = new Date(dateString); // Parse the date string
//         const utcYear = date.getUTCFullYear();
//         const utcMonth = date.getUTCMonth(); // Month is zero-based
//         const utcDay = date.getUTCDate();

//         // Format the date as "Month Day, Year"
//         return new Date(Date.UTC(utcYear, utcMonth, utcDay)).toLocaleDateString(undefined, {
//           year: "numeric",
//           month: "long",
//           day: "numeric",
//         });
//       };

//   const [rangeDate, setRangeDate] = useState({
//     from: startOfDay(subDays(new Date(), 30)),
//     to: endOfDay(new Date()),
//   });
//   const [popoverOpen, setPopoverOpen] = useState({ from: false, to: false });

//   const handleDateChange = (which, date) => {
//     setRangeDate((prev) => ({
//       ...prev,
//       [which]: date
//         ? which === "from"
//           ? startOfDay(date)
//           : endOfDay(date)
//         : undefined, // Ensure startOfDay and endOfDay
//     }));
//     setPopoverOpen((prev) => ({ ...prev, [which]: false })); // Close popover after selection
//   };

//   const filteringData = useMemo(() => {
//     const { from, to } = rangeDate;

//     // Filter transactions within date range
//     const filtering = transactions.filter((t) => {
//       const transactionDate = new Date(t.date);
//       return (
//         (!from || transactionDate >= from) && (!to || transactionDate <= to)
//       );
//     });





//     const grouped = filtering.reduce((acc, transaction) => {
//       const date = format(new Date(transaction.date), "MMM dd");

//       if (!acc[date]) {
//         acc[date] = { date, income: 0, expense: 0 };
//       }

//       if (transaction.type === "INCOME") {
//         acc[date].income += transaction.amount;
//       } else {
//         acc[date].expense += transaction.amount;
//       }
//       return acc;
//     }, {});

//     //  convert to array and sort by date
//     return Object.values(grouped).sort(
//       (a, b) => new Date(a.date) - new Date(b.date)
//     );
//   }, [transactions, rangeDate]);

//   const totals = useMemo(() => {
//     return filteringData.reduce(
//       (acc, day) => ({
//         income: acc.income + day.income,
//         expense: acc.expense + day.expense,
//       }),
//       { income: 0, expense: 0 }
//     );
//   }, [filteringData]);




//   return (
//     <Card>
//       <CardHeader className="flex lg:flex-row md:flex-row items-center justify-between space-y-4 pb-7">
//         <CardTitle className="text-base font-normal">
//           Transaction Overview
//         </CardTitle>
//         <div className="flex flex-col sm:flex-row items-center gap-4">
//           <Popover
//             open={popoverOpen.from}
//             onOpenChange={(open) =>
//               setPopoverOpen((prev) => ({ ...prev, from: open }))
//             }
//           >
//             <PopoverTrigger asChild>
//               <Button
//                 variant={"outline"}
//                 className={cn(
//                   "w-[180px] justify-center text-balance font-normal",
//                   !rangeDate.from && "text-muted-foreground"
//                 )}
//               >
//                 <CalendarIcon className="mr-2 h-4 w-4" />
//                 {rangeDate.from ? (
//                   format(rangeDate.from, "MMM dd, yyyy")
//                 ) : (
//                   <span>From</span>
//                 )}
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-auto p-0" align="start">
//               <Calendar
//                 mode="single"
//                 selected={rangeDate.from}
//                 onSelect={(date) => handleDateChange("from", date)}
//                 initialFocus
//               />
//             </PopoverContent>
//           </Popover>

//           <Popover
//             open={popoverOpen.to}
//             onOpenChange={(open) =>
//               setPopoverOpen((prev) => ({ ...prev, to: open }))
//             }
//           >
//             <PopoverTrigger asChild>
//               <Button
//                 variant={"outline"}
//                 className={cn(
//                   "w-[180px] justify-center text-left font-normal",
//                   !rangeDate.to && "text-muted-foreground"
//                 )}
//               >
//                 <CalendarIcon className="mr-2 h-4 w-4" />
//                 {rangeDate.to ? (
//                   format(rangeDate.to, "MMM dd, yyyy")
//                 ) : (
//                   <span>To</span>
//                 )}
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-auto p-0" align="start">
//               <Calendar
//                 mode="single"
//                 selected={rangeDate.to}
//                 onSelect={(date) => handleDateChange("to", date)}
//                 initialFocus
//               />
//             </PopoverContent>
//           </Popover>
//         </div>
//         {/* <Select
//             defaultValue={dateRange}
//             onValueChange={setDateRange}>
//                 <SelectTrigger className="w-[140px]">
//                     <SelectValue placeholder="Select Range"/>
//                 </SelectTrigger>
//                 <SelectContent>
//                     {Object.entries(DATE_RANGES).map(([key, {label}]) => {
//                         return (<SelectItem key={key} value={key}>
//                             {label}
//                         </SelectItem>);
//                     })}
//                 </SelectContent>

//         </Select> */}
//       </CardHeader>
//       <CardContent>
//         <div className="lg:flex md:flex sm:flex lg:flex-row md:flex-row sm:flex-col justify-around mb-6 text-sm">
//           <div className="text-center">
//             <p className="text-muted-foreground">Total Income</p>
//             <p className="text-lg font-bold text-green-500">
//               {formatAmount(totals.income.toFixed(2))}
//             </p>
//           </div>

//           <div className="text-center">
//             <p className="text-muted-foreground">Total Expenses</p>
//             <p className="text-lg font-bold text-red-500">
//               {formatAmount(totals.expense.toFixed(2))}
//             </p>
//           </div>

//           <div className="text-center">
//             <p className="text-muted-foreground">Net</p>
//             <p
//               className={`text-lg font-bold ${
//                 totals.income - totals.expense > 0
//                   ? "text-green-500"
//                   : "text-red-500"
//               }`}
//             >
//               {formatAmount((totals.income - totals.expense).toFixed(2))}
//             </p>
//           </div>
//         </div>

//         <div
//           // className="h-[300px] sm:h-[400px] md:h-[300px] overflow-x-auto lg:overflow-x-hidden"
//           className="h-[300px] sm:h-[400px] md:h-[300px] lg:h-[400px]"
//         >
//           {/* <div
//           // className={`h-full ${
//           //   filteredData.length * 50 > 600
//           //     ? "min-w-[900px] md:min-w-[900px]"
//           //     : "w-full md:w-full"
//           // } lg:w-full sm:max-w-full md:max-w-full`}
//           // style={{
//           //   width:
//           //     filteredData.length > 0
//           //       ? `${Math.max(filteredData.length * 50, 600)}px` // Dynamic width based on data
//           //       : "1400px",
//           // }}
//           > */}
//           {/* <ResponsiveContainer
//                     width="100%" height="100%"
//                     // className="sm:scale-[1.5] sm:origin-top-left md:scale-[1.5] md:origin-top-left lg:scale-100"
//                     >
//                         <BarChart

//                         data={filteringData} //if want date picker, change to filteringDate
//                         margin={{
//                             top: 10,
//                             right: 10,
//                             left: 10,
//                             bottom: 0,
//                         }}
//                         >
//                         <CartesianGrid strokeDasharray="3 3" vertical={false}/>
//                         <XAxis
//                             dataKey="date"
//                             tick={{
//                             fontSize: window.innerWidth < 768 ? 16 : window.innerWidth < 1024 ? 14 : 12, }}/>
//                         <YAxis
//                             tickLine={false}
//                             axisLine={false}
//                             tickFormatter={(value) => `₱${value}`}
//                             tick={{
//                                 fontSize: window.innerWidth < 768 ? 16 : window.innerWidth < 1024 ? 14 : 12,
//                             }}
//                             />
//                         <Tooltip
//                             formatter={(value) => [`₱${(value).toFixed(2)}`, undefined]}
//                             contentStyle={{
//                                 fontSize: `${window.innerWidth < 768 ? 16 : window.innerWidth < 1024 ? 14 : 12}px`,
//                               }}
//                               />
//                         <Legend
//                            wrapperStyle={{
//                             fontSize: `${window.innerWidth < 768 ? 16 : window.innerWidth < 1024 ? 14 : 12}px`, // Larger font size for smaller screens
//                         }}/>
//                         <Bar
//                             dataKey="income"
//                             name="Income"
//                             fill="#22c55e"
//                             radius={[4,4,0,0]} />
//                         <Bar
//                             dataKey="expense"
//                             name="Expense"
//                             fill="#ef4444"
//                             radius={[4,4,0,0]}/>
//                         </BarChart>
//                     </ResponsiveContainer> */}

//           <LineChart
//             xAxis={[
//               {
//                 dataKey: "date",
//                 scaleType: "band",
//                 label: "Date",
//               },
//             ]}
//             series={[
//               {
//                 dataKey: "INCOME",
//                 label: "Income",
//                 color: "#22c55e",
//               },
//               {
//                 dataKey: "EXPENSE",
//                 label: "Expense",
//                 color: "#ef4444",
//               },
//             ]}
//             height={300}
//             dataset={filteringData}
//             grid={{ horizontal: true, vertical: true }}
//           />
//           {/* </div> */}
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// export default AccountChart;



































































"use client";

import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TextField } from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


// Custom date formatter
const formatDate = (date) => {
  const options = { month: "short", day: "2-digit" };
  return new Intl.DateTimeFormat("en-US", options).format(date);
};

// Helper to get the start of the day
const getStartOfDay = (date) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

// Helper to get the end of the day
const getEndOfDay = (date) => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

// Helper to subtract days from a date
const subtractDays = (date, days) => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() - days);
  return newDate;
};

// Generate an array of dates between two dates
const generateDateRange = (from, to) => {
  const dates = [];
  let currentDate = new Date(from);
  while (currentDate <= to) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};

const AccountChart = ({ transactions }) => {
  // Default to last 30 days
  const [dateRange, setDateRange] = useState({
    from: getStartOfDay(subtractDays(new Date(), 30)),
    to: getEndOfDay(new Date()),
  });

  // Handle date changes
  const handleDateChange = (key, value) => {
    setDateRange((prev) => ({
      ...prev,
      [key]: value
        ? key === "from"
          ? getStartOfDay(value)
          : getEndOfDay(value)
        : null,
    }));
  };

  // Filter and group transactions by date range
  const filteredData = useMemo(() => {
    const { from, to } = dateRange;

    // Generate all dates in the range
    const allDates = generateDateRange(from, to).map((date) => ({
      date: formatDate(date),
      income: 0,
      expense: 0,
    }));

    // Map transactions to the corresponding dates
    transactions.forEach((transaction) => {
      const transactionDate = formatDate(new Date(transaction.date));
      const dateEntry = allDates.find(
        (entry) => entry.date === transactionDate
      );
      if (dateEntry) {
        if (transaction.type === "INCOME") {
          dateEntry.income += transaction.amount;
        } else if (transaction.type === "EXPENSE") {
          dateEntry.expense += transaction.amount;
        }
      }
    });

    return allDates;
  }, [transactions, dateRange]);

  console.log("filtered DAta:", filteredData.length)
  // Calculate totals
  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, day) => ({
        income: acc.income + day.income,
        expense: acc.expense + day.expense,
      }),
      { income: 0, expense: 0 }
    );
  }, [filteredData]);

  // Format amounts with commas and peso sign
  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const chartWidth = useMemo(() => {
    const minWidth = 600;
    const pxPerPoint = 80;
    return Math.max(filteredData.length * pxPerPoint, minWidth);
  }, [filteredData.length]);






  return (

    <>
    <Card>
      <CardHeader className="flex  flex-col sm:flex-row items-center justify-between space-y-0 pb-7">
        <CardTitle className="text-3xl font-bold text-gray-800 tracking-wider">
            Transaction Overview
        </CardTitle>
        <div className="flex py-2 flex-col sm:flex-row gap-2 justify-between items-center">
         <LocalizationProvider dateAdapter={AdapterDateFns}>
           <DatePicker
              label="From"
              value={dateRange.from}
              onChange={(date) => handleDateChange("from", date)}
              slotProps={{
                textField: {
                  className: "w-full sm:w-[200px]",
                  variant: "outlined", // optional, for MUI style
                },
              }}
            />
            <DatePicker
              label="To"
              value={dateRange.to}
              onChange={(date) => handleDateChange("to", date)}
              slotProps={{
                textField: {
                  className: "w-full sm:w-[200px]",
                  variant: "outlined", // optional, for MUI style
                },
              }}
            />
          </LocalizationProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row justify-around mb-6 text-sm">
          <div className="text-center">
            <p className="text-muted-foreground"
              style={{ fontFamily: "Verdana" }}>Total Income</p>
            <p className="text-lg font-bold text-green-500"
            style={{ fontFamily: "Verdana" }}>
              {formatAmount(totals.income)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground"
            style={{ fontFamily: "Verdana" }}>Total Expenses</p>
            <p className="text-lg font-bold text-red-500"
            style={{ fontFamily: "Verdana" }}>
              {formatAmount(totals.expense)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground"
            style={{ fontFamily: "Verdana" }}>Net Change</p>
            <p
              className={`text-lg font-bold ${
                totals.income - totals.expense >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
              style={{ fontFamily: "Verdana" }}
            >
              {formatAmount(totals.income - totals.expense)}
            </p>
          </div>
        </div>



        <div className="overflow-x-auto w-full">
          <div 
          style={{ minWidth: chartWidth }}>
        {filteredData.length > 0 ? (
          <ResponsiveContainer
            // width={filteredData.length * 50 } // Dynamic width based on the number of dates
            width="100%"
            height={480}
          >
            <LineChart
              data={filteredData}
              margin={{ top: 20, right: 30, left: 20, bottom: 50 }} // Adjusted margins
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }} // Smaller font size for X-axis labels
                interval={0} // Show all dates
                angle={-45} // Rotate labels for better readability
                textAnchor="end"
              />
              <YAxis
                tickFormatter={(value) => formatAmount(value)}
                tick={{ fontSize: 12 }} // Smaller font size for Y-axis labels
              />
              <Tooltip
                formatter={(value) => formatAmount(value)}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#22c55e"
                name="Income"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#ef4444"
                name="Expense"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-muted-foreground">
            No data available for the selected date range.
          </p>
        )}
        </div>
      </div>
        
      </CardContent>
      </Card>
    </>
  );
};

export default AccountChart;
