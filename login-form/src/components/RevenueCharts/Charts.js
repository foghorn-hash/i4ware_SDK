import React, { useState, useContext, useEffect } from "react";
import TransactionsTable from "./TransactionsTable";
import TransactionsTableAll from "./TransactionsTableAll";
import CumulativeChart from "./CumulativeChart";

const Charts = () => {
    return (
      <div>
        <TransactionsTable />
        <TransactionsTableAll />
        <CumulativeChart />
      </div>
    );
};

export default Charts;
