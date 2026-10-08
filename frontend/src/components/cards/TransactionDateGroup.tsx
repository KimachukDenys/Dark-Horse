import TransactionCard from "./TransactionCard";
import type { TransactionType } from "../../types/transaction.types";
import type { Notification } from "../../types/global.types";
import type React from "react";



function TransactionDateGroup({
  date,
  buyQuantity,
  transactions,
  filterItems,
  setNotification
}: {
  date: string;
  buyQuantity: number;
  transactions: TransactionType[];
  filterItems: () => void;
  setNotification: React.Dispatch<React.SetStateAction<Notification | null>>;
}) {
  return (
    <section className="transaction-date-group">
      <div className="grop-header-container">
        <h3>Date: {date}</h3>
        <h3>Purchased: {buyQuantity}</h3>
      </div>

      <div className="transaction-list">
        {transactions.map((tx) => (
          <TransactionCard
            key={tx.id}
            tx={tx}
            onDelete={filterItems}
            setNotification={setNotification}
          />
        ))}
      </div>
    </section>
  );
}

export default TransactionDateGroup