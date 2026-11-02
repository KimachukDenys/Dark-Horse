import TransactionPage from "../../pages/Transaction/TransactionPage";
import TransactionFormPage from "../../pages/Transaction/TransactionFormPage";
import TransactionModal from "../modal/TransactionModal";

import Authentication from "../../pages/User/Authentication";
import ProtectedRoute from "./ProtectedRoute";

import GoalPage from "../../pages/Goal/GoalPage";
import GoalInfoPage from "../../pages/Goal/GoalInfoPage";
import GoalForm from "../../forms/GoalForm";

import DashboardPage from "../../pages/DashboardPage";

import WalletPage from "../../pages/WalletPage";
import WalletForm from "../../forms/WalletForm";

import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/auth.context";
import { useWallet } from "../../hooks/wallet.context";
import "../../styles/navBar.css"
import { api } from "../../api/axios";
import axios from "axios";
import { useState } from "react";

function NavBar() {
  const {user, clearAuth, loading} = useAuth()
  const {wallets, invest} = useWallet()
  const [walletInfoShow, setWalletInfoShow] = useState({
    balance: "none",
    locked: "none"
  })

  let balanceAcrossAll = 0;
  wallets.map((w) => {
    return balanceAcrossAll += Number(w.balance)
  })

  const logout = async () => {
    try {
      const res = await api.delete("/user/logout")
      clearAuth()
      console.log(res.data)
    } catch (e: unknown) {
      if(axios.isAxiosError(e)) {
        console.log(e.response?.data?.message)
      }
    }
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const name = e.currentTarget.id
    setWalletInfoShow((prev) => ({
      ...prev,
      [name]: "flex"
    }))
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const name = e.currentTarget.id
    setWalletInfoShow((prev) => ({
      ...prev,
      [name]: "none"
    }))
  };

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
              <li className="nav-list_element">
                <NavLink to="/wallets">Wallets</NavLink>
              </li>
            </ul>
          </nav>
            { loading ? null : user ? 
              ( 
                <div className="nav-user-logged">
                  <div className="nav-wallets">
                    <div className="wallets-info"    
                      style={{display: walletInfoShow.balance}}
                    >
                      {wallets.map((w) => (
                        <div key={w.market.id}>
                          <p>{w.market.name}: ${Number(w.balance).toFixed(2)}</p>
                        </div>
                      ))} 
                    </div>

                    <div className="wallets-info"
                      style={{display: walletInfoShow.locked}}
                    >
                      <p>Trade Locked balance</p>
                    </div>
                    <div
                      id="balance"
                      className="nav-balance"
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                      >
                      <p>${balanceAcrossAll.toFixed(2)}</p>
                    </div>
                    <div 
                      id="locked"
                      className="nav-pending"
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      <p>+${Number(invest).toFixed(2)}</p>
                    </div>
                  </div>
                  <button className="nav-list_element" onClick={logout}>Logout</button>
                </div>
              ) : (
                <p className="nav-list_element">
                  <NavLink to="/authentication">Login</NavLink>
                </p>
              )
            }
        </div>
      </header>

      <Routes>
        <Route path="/authentication" element={<Authentication/>}></Route>

        <Route element={<ProtectedRoute/>}>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
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

          <Route path="/wallets" element={<WalletPage />}></Route>
          <Route path="/create-wallet" element={<WalletForm />}></Route>
          <Route path="/edit-wallet/:walletId" element={<WalletForm edit={true}/>}></Route>
        </Route>
      </Routes>
      </BrowserRouter>
    </>
  );
}

export default NavBar