import React, { useState, useContext, useEffect } from "react";
import TransactionsTable from "./TransactionsTable";
import ButtonsToAdd from "./ButtonsToAdd";
import TransactionsTableAll from "./TransactionsTableAll";
import CumulativeChart from "./CumulativeChart";

const Charts = () => {
    return (
      <div>
        <ButtonsToAdd />
        <TransactionsTable />
        <TransactionsTableAll />
        <CumulativeChart />
      </div>
    );
};

export default Charts;
