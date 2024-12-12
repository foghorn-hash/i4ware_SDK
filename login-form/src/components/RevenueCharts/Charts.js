import React, { useState, useContext, useEffect } from "react";
import TransactionsTable from "./TransactionsTable";
import TransactionsTableAll from "./TransactionsTableAll";
import CumulativeChart from "./CumulativeChart";

const Charts = () => {
    return (
      <di>
        <TransactionsTable />
        <TransactionsTableAll />
        <CumulativeChart />
      </di>
    );
};

export default Charts;
