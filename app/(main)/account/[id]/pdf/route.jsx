

"use client";
import React from 'react';
import {  Page,      
  Text,
  View,
  Document,
  StyleSheet,
  renderToStream,
  Font } from '@react-pdf/renderer';
import { NextResponse } from 'next/server';
import { differenceInDays, differenceInMonths, format } from 'date-fns';


Font.register({
    family: 'Roboto',
    fonts: [
      {
        src: '/fonts/Roboto/static/Roboto-Regular.ttf', // Regular font
      },
      {
        src: '/fonts/Roboto/static/Roboto-Bold.ttf', // Bold font
        fontWeight: 'bold',
      },
    ],
  });

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 11,
    padding: 30,
  },
  titleProper: {
    fontFamily: 'Roboto',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitleProper: {
    fontFamily: 'Roboto',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 15, // Add spacing between sections
  },
  rowProper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    borderBottom: '1px solid #ddd',
    paddingBottom: 5,
  },
  leftCellProper: {
    width: '70%',
    textAlign: 'left',
    padding: '5px 8px',
    fontWeight: 'bold',
  },
  rightCellProper: {
    width: '30%',
    textAlign: 'right',
    padding: '5px 8px',
    fontWeight: 'bold',
    fontFamily: 'Roboto'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
    borderBottom: '1px solid #eee', // Lighter border for transaction rows
  },
  leftCell: {
    width: '70%',
    textAlign: 'left',
    padding: '5px 8px',
  },
  rightCell: {
    width: '30%',
    textAlign: 'right',
    padding: '5px 8px',
  },
  table: {
    width: '500px', // Fixed table width
    margin: '0 auto', // Center the table
  },
});
const deterimeTimeFrame = (startDate, endDate) => {
  const daysDifference = differenceInDays(endDate, startDate);
  const monthsDifference = differenceInMonths(endDate, startDate)

  switch (true) {
    case daysDifference === 0:
      return "Daily";
    case daysDifference <= 7:
      return "Weekly";
    case monthsDifference === 0:
      return "Monthly";
    default:
      return "No Transaction Selected"
  }
}
const MyPDFaccountPage = ({ cashflow, transactions, subAccounts }) => {
  
  if (!cashflow || cashflow.length === 0) {
    return (
      <Document>
        <Page style={styles.page}>
          <Text>No Cashflow data available.</Text>
        </Page>
      </Document>
    );
  }

  const transactionDates = transactions.map((transaction) => 
    new Date(transaction.date)
  )

  const startDate =  new Date(Math.min(...transactionDates));
  const endDate = new Date(Math.max(...transactionDates));

  const timeFrame = deterimeTimeFrame(startDate, endDate);

  const formattedStartDate = format(startDate, 'MMMM dd, yyyy');
  const formattedEndDate = format(endDate, 'MMMM dd, yyyy')
 
  const latestCashflow = cashflow;
  const transactionsIn = transactions;
  // const transactionsIn = cashflow[0].transactions;
  
  console.log("ROUTER forCfs latest:", latestCashflow, typeof latestCashflow);


  const OperatingTransactions = transactionsIn.filter(
    (transaction) => transaction.Activity === "OPERATION"
  );


  
    // const formattedBalance = latestCashflow.subAccounts.transcations.transcation.type
    //   ? `-${formatAmount(subAccount.balance.toFixed(3))}`
    //   : formatAmount(subAccount.balance.toFixed(3));
  
  
  const InvestingTransactions = transactionsIn.filter(
    (transaction) => transaction.Activity === "INVESTMENT"
  );
  const FinanceTransactions = transactionsIn.filter(
    (transaction) => transaction.Activity === "FINANCING"
  );
  // console.log("Latest CFS ",latestCashflow)
  
  // console.log("Latest transactions in CFS ",transactions)

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      currencyDisplay: 'symbol',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(amount);
  };
  

  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.table}>
          <Text style={styles.titleProper}>Teruel Accounting Firm</Text>
          <Text style={styles.subtitleProper}>{timeFrame} Cashflow Statement</Text>
          {startDate.toDateString() === endDate.toDateString()
            ? <Text style={styles.subtitleProper}>As of: {formattedStartDate}</Text>
            : <Text style={styles.subtitleProper}>For the period: {formattedStartDate} - {formattedEndDate}</Text>
          }
          
          <View style={styles.rowProper}>
            <Text style={styles.leftCellProper}>Operating Activities:</Text>
            <Text style={styles.rightCellProper}>Amount (PHP)</Text>
          </View>
          
            {/* OPERATING ACTIVITIES */}
          {OperatingTransactions.map((transaction, index) => (
          <View style={styles.row} key={index}>
            <Text style={styles.leftCell}>{transaction.description}</Text>
            <Text style={styles.rightCell}>{formatAmount(transaction.amount.toFixed(3))}</Text>
          </View>
          ))}
          
          <View style={styles.row} >
          <Text style={styles.leftCell}>Net Cash from Operating Activity</Text>
          <Text style={styles.rightCell}>{formatAmount(latestCashflow.activityTotal[0].toFixed(3))}</Text></View>


          {/* INVESTMENT ACTIVITIES */}
          <View style={styles.rowProper}>
            <Text style={styles.leftCellProper}>Investing Activities:</Text>
          </View>
          {InvestingTransactions.map((transaction, index) => (
          <View style={styles.row} key={index}>
            <Text style={styles.leftCell}>{transaction.description}</Text>
            <Text style={styles.rightCell}>{formatAmount(transaction.amount.toFixed(3))}</Text>
          </View>
        ))}
          <View style={styles.row} >
          <Text style={styles.leftCell}>Net Cash from Investment Activity</Text>
          <Text style={styles.rightCell}>{formatAmount(latestCashflow.activityTotal[1].toFixed(3))} </Text></View>


        {/* FINANCING ACTIVITIES */}
        <View style={styles.rowProper}>
            <Text style={styles.leftCellProper}>Financing Activities:</Text>
          </View>
        {FinanceTransactions.map((transaction, index) => (
          <View style={styles.row} key={index}>
            <Text style={styles.leftCell}>{transaction.description}</Text>
            <Text style={styles.rightCell}>{formatAmount(transaction.amount.toFixed(3))} </Text>
          </View>
        ))}

          <View style={styles.row} >
          <Text style={styles.leftCell}>Net Cash from Financing Activity</Text>
          <Text style={styles.rightCell}>{formatAmount(latestCashflow.activityTotal[2].toFixed(3))}</Text>
          </View>

          {/* TOTALS */}
          <View style={styles.rowProper}>
            <Text style={styles.leftCellProper}>Gross:</Text>
            <Text style={styles.rightCellProper}>{formatAmount(latestCashflow.netChange.toFixed(3))}</Text>
          </View>
          <View style={styles.rowProper}>
            <Text style={styles.leftCellProper}>Beginning Net Cash:</Text>
            <Text style={styles.rightCellProper}>{formatAmount(latestCashflow.startBalance.toFixed(3))}</Text>
          </View>
          <View style={styles.rowProper}>
            <Text style={styles.leftCellProper}>Ending Balance:</Text>
            <Text style={styles.rightCellProper}>{formatAmount(latestCashflow.endBalance.toFixed(3))}</Text>
          </View>
        
          
        </View>

        
        

       
      </Page>
    </Document>
  );
};
export default MyPDFaccountPage;

export async function GET(req, { params, cashflow, subAccounts}) {
  const { id } = params;
  const cashflowData = cashflow; // Assuming cashflow is already the data you need.
  const transactionData = transactions;
  const subAccountsData = subAccounts

  if (!cashflowData || !Array.isArray(cashflowData)) {
    return new NextResponse('Cashflow data is invalid or missing.', { status: 400 });
  }
  console.log('CFS prop data',cashflowData)

  const stream = await renderToStream(<MyPDFaccountPage id={id} subAccounts={subAccountsData} cashflow={cashflowData} transactions={transactionData}/>);
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'application/pdf',
      // "Content-Disposition": `attachment; filename="cashflow-statement.pdf"`,
    },
  });
}