import TransactionPage from "../../pages/Transaction/TransactionPage";
import TransactionFormPage from "../../pages/Transaction/TransactionFormPage";
import TransactionModal from "../modal/TransactionModal";
import GoalPage from "../../pages/Goal/GoalPage";
import GoalInfoPage from "../../pages/Goal/GoalInfoPage";
import GoalForm from "../../forms/GoalForm";
import DashboardPage from "../../pages/DashboardPage";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import type { MarketType } from "../../types/market.types";
import { api } from "../../api/axios";
import "../../styles/navBar.css"
import type { TransactionType } from "../../types/transaction.types";

function NavBar() {
  const [markets, setMarkets] = useState<MarketType[]>([])
  const [invItems, setInvItems] = useState<TransactionType[]>([])
  
  async function getMarkets() {
    try {
      const res = await api.get("/market/")
      setMarkets(res.data.data)
    } catch (e) {
      console.log(e)
    }
  }

  async function getOnInvetory() {
    try {
      const res = await api.get("/transaction/get-inventory")
      setInvItems(res.data.data)
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    getMarkets()
    getOnInvetory()
  }, [])

  function spend() {
    let moneyOnItems = 0

    invItems.map((i) =>  moneyOnItems += Number(Number(i.price).toFixed(2)))

    return(
      <div className="on-inventory">
        <p className="nav-balance-name">Pending</p>
        <p>{moneyOnItems.toFixed(2)}$</p>
      </div>
    )
  }

  return (
    <>
      <BrowserRouter>
      <header className="nav">
        <div className="nav-container container">
          <div className="nav-logo_container">
            <h2 className="nav-logo">DH</h2>
          </div>
          <nav className="nav-bar">
            <ul className="nav-list">
              <li className="nav-list_element">
                <NavLink to="/Dashboard">Dashboard</NavLink>
              </li>
              <li className="nav-list_element">
                <NavLink to="/transactions">Transactions</NavLink>
              </li>
              <li className="nav-list_element">
                <NavLink to="/create-transaction">Create Transaction</NavLink>
              </li>
              <li className="nav-list_element">
                <NavLink to="/goals">Goals</NavLink>
              </li>
            </ul>
          </nav>
          <div className="nav-markets">
            {markets.map((m) => (
              <div key={m.id}>
                <p className="nav-balance-name">{m.name.toLowerCase()}</p>
                <p>{Number(m.wallet.balance).toFixed(2)}$</p>
              </div>
            ))}
            {spend()}
          </div>
        </div>
      </header>

      <Routes>
        <Route path="/dashboard" element={<DashboardPage />}></Route>
        <Route path="/transactions" element={<TransactionPage />}/>
        <Route path="/create-transaction" element={<TransactionFormPage />}/>
        <Route path="/edit-transaction/:txId" element={<TransactionFormPage edit={true} />} />
        <Route path="/sell-transaction/:txId" element={<TransactionFormPage sell={true} />} />
        <Route path="/same-transaction/:txId" element={<TransactionFormPage same={true} />} />
        <Route path="/transactions/trade/:txId" element={<TransactionModal />} />
        <Route path="/goals" element={<GoalPage />}/>
        <Route path="/goal/:goalId" element={<GoalInfoPage />}/>
        <Route path="/create-goal" element={<GoalForm />}/>
        <Route path="/edit-goal/:goalId" element={<GoalForm edit={true} />}/>
      </Routes>
      </BrowserRouter>
    </>
  );
}

export default NavBar