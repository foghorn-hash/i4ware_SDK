import React, { useState, useContext, useEffect } from "react";
import TransactionsTable from "./TransactionsTable";
import CustomersTable from "./CustomersTable";

import ButtonsToAdd from "./ButtonsToAdd";
import TransactionsTableAll from "./TransactionsTableAll";
import CumulativeChart from "./CumulativeChart";
import MonthlyIncomeForYear from "./MonthlyIncomeForYear";

const Charts = () => {
    return (
      <div>
        <ButtonsToAdd />
        
        <TransactionsTable />
        <MonthlyIncomeForYear year={new Date().getFullYear()} />
        <TransactionsTableAll />
        <CumulativeChart />
        <CustomersTable />
      </div>
    );
};

export default Charts;
