import React, { useEffect, useState } from "react";
import { api } from "../api/axios";
import { specialTypes, wearTypes, floatValues } from "../types/transaction.types";
import { Link, useParams } from "react-router-dom";
import { calculation, roiCalculation } from "../utils/calculation";
import Notification from "../components/notification/Notification";
import type { MarketType } from "../types/market.types";
import "../styles/transaction/txFormStyles.css"
import axios from "axios";



function TransactionForm({edit = false, sell = false, same = false}) {
  const { txId } = useParams();
  const [markets, setMarkets] = useState<MarketType[]>([])
  const [itemInput, setItemInput] = useState("");
  const [priceInput, setPriceInput] = useState("10");
  const [data, setData] = useState({
    itemName: "",
    special: "NORMAL",
    wear: "NONE",
    floatValue: 0,
    price: 10,
    type: "BUY",
    quantity: 1,
    itemCurrency: "UAH",
    csFloatId: "",
    steamAssetId: "",
    steamInstanceId: "",
    steamClassId: "",
    sourceBuyId: undefined as number | undefined,
    marketId: "1",
    itemId: 0,
    acquiredAt: new Date().toISOString().substring(0,10)
  })
  const [roiData, setRoiData] = useState({
    roi: 0,
    buyPrice: 0
  })
  const [notification, setNotification] = useState<{
    id: number;
    message: string;
    type: string;
  } | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const handleInput = (e: React.MouseEvent<HTMLButtonElement> | React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.currentTarget;
    if(name === "wear") {
      const floatValue = floatValues[value as keyof typeof floatValues]
      setData((prev) => ({
        ...prev,
        floatValue: floatValue,
        [name]: value,
      }))
      return
    }

    if(name === "price") {
      setPriceInput(value)
      const calc = calculation(value);
      const price = calc.newPrice;
      
      if (sell) {
        const roiCalc = roiCalculation(
          price,
          roiData.buyPrice,
          data.itemCurrency,
          data.itemCurrency
        );
        setRoiData((prev) => ({
          ...prev,
          roi: roiCalc.roi,
        }));
      }
      
      setData((prev) => ({
        ...prev, 
        price,
        quantity: Number(calc.quantity)
      }))
      return
    }

    if(name === "itemCurrency") {  
      const roiCal = roiCalculation(data.price, roiData.buyPrice, value, data.itemCurrency)

      if(sell) {
        setRoiData((prev) => ({
          ...prev,
          roi: roiCal.roi
        }))
      }

      setPriceInput(roiCal.price.toFixed(2))
      setData((prev) => ({
        ...prev,
        price: roiCal.price
      }))
    }

    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  
  const handleItemName = (e: React.ChangeEvent<HTMLInputElement>) => {
    let item = e.target.value;

    setItemInput(item)

    const itemSpecial = item.split(" ", 1).toString();
    
    const fullWear = item.substring(
      item.indexOf("(") + 1,
      item.lastIndexOf(")")
    );

    const wear = wearTypes[fullWear] ?? "NONE";

    if(wear === "NONE") {
      if(item.includes("/")) {
        item = item.replace(/\/+(?=[^\(\)]*\))/g, "-")
      }
      setData((prev) => ({
        ...prev,
        itemName: item,
        wear: "NONE",
        floatValue: 0
      }))
      return
    }


    const special = specialTypes[itemSpecial as keyof typeof specialTypes] ?? "NORMAL";

    const startIndex = special.toString() === "NORMAL" 
      ? item.indexOf(itemSpecial)
      : item.indexOf(itemSpecial) + itemSpecial.length + 1

    if (!item.includes("(") || !item.includes(")")) {
      const itemName = item.substring(startIndex).trim()

      setData((prev) => ({
        ...prev,
        itemName: itemName,
        special,
        floatValue: 0.06
      }))

      return;
    }

    const itemName = item.substring(
      startIndex,
      item.lastIndexOf(" (")
    ).trim()


    const float = floatValues[wear] ?? 0.06;
    
    setData((prev) => ({
      ...prev,
      itemName: itemName,
      special,
      wear,
      floatValue: float
    }));
  };


  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const now = new Date()
    const acquiredAt = new Date(data.acquiredAt)
    acquiredAt.setHours(now.getHours())
    acquiredAt.setMinutes(now.getMinutes())
    
    const body = {
      item: {
        id: data.itemId,
        name: data.itemName.trim()
      },
      transaction: {
        special: data.special,
        wear: data.wear,
        floatValue: data.floatValue,

        price: Number(data.price),
        type: data.type,
        quantity: Number(data.quantity),
        itemCurrency: data.itemCurrency,

        csFloatId: data.csFloatId || undefined,
        steamAssetId: data.steamAssetId || undefined,
        steamInstanceId: data.steamInstanceId || undefined,
        steamClassId: data.steamClassId || undefined,

        sourceBuyId: Number(data.sourceBuyId) || undefined,
        marketId: Number(data.marketId),

        acquiredAt: acquiredAt.toISOString()
      }
    }
    try {
      let res
      if(edit) {
        res = await api.patch(`/transaction/update/${txId}`, body)
      
      } else if(sell) {
        await api.patch(`/transaction/update-status/${txId}`, {
          quantity: Number(data.quantity)
        })
        
        res = await api.post("/transaction/create/tx", body);  
      } else {
        res = await api.post("/transaction/create/tx", body);
      }
      setNotification({
        id: Date.now(),
        message: res.data.message,
        type: "success",
      })
    } catch (e: unknown) {
      if(axios.isAxiosError(e)) {
        console.error(e);
        setNotification({
          id: Date.now(),
          message: e.response?.data?.message ?? "Something went wrong",
          type: "error",
        })
      }
    }
  };


  useEffect(() => {
    async function getTransaction() {
      try {
        if(!txId || txId === "create") {
          return
        }
        const res = await api.get(`/transaction/${txId}`);
        
        const tx = res.data.data;
        setData({
          itemName: tx.item.name,
          special: tx.special,
          wear: tx.wear,
          floatValue: tx.floatValue,
          price: tx.price,
          type: tx.type,
          quantity: tx.quantity,
          itemCurrency: tx.itemCurrency,
          csFloatId: tx.csFloatId,
          steamAssetId: tx.steamAssetId,
          steamInstanceId: tx.steamInstanceId,
          steamClassId: tx.steamClassId,
          marketId: tx.marketId.toString(),
          sourceBuyId: undefined,
          itemId: tx.item.id,
          acquiredAt: tx.acquiredAt
        })
        if(sell && txId) {
          setData((prev) => ({
            ...prev,
            type: "SELL",
            sourceBuyId: Number(tx.id),
          }))

          setRoiData((prev) => ({
            ...prev,
            buyPrice: Number(tx.price)
          }))
        }
        setItemInput(tx.item.name)
        setPriceInput(tx.price)
      } catch (e) {
        console.log(e)
      }
    }
    
    if((same && txId) || (edit && txId) || (sell && txId)) {
      getTransaction()
    } 
  }, [edit, sell, same, txId])


  useEffect(() => {
    async function getMarkets() {
      const res = await api.get("/market")
      setMarkets(res.data.data)
    };

    getMarkets();
  }, []);

  return (
    <form onSubmit={handleSubmit} className="transaction-form">
      <div className="form-left-side">
        <div className="form-select-buttons">
          <h4>Market:</h4>
          {markets.map((market) => (
            <button key={market.id}
            type="button" 
            name="marketId"
            className={`action-btn btn-default ${data.marketId === `${market.id}` ? "active-action" : ""}`}
            value={market.id}
            onClick={handleInput}
            >
              {market.name}
            </button>
          ))}
        </div>


        <div className="form-item-name-container">
          <div className="form-specials-buttons">
            <button type="button"
              name="special"
              className={`action-btn btn-default ${data.special === "NORMAL" ? "active-action" : ""}`}
              value="NORMAL"
              onClick={handleInput}
              >
              Normal
            </button>
            <button type="button"
              name="special"
              className={`action-btn btn-default ${data.special === "STATTRAK" ? "active-action" : ""}`}
              value="STATTRAK"
              onClick={handleInput}
              >
              StatTrak™
            </button>
            <button type="button"
              name="special"
              className={`action-btn btn-default ${data.special === "SOUVENIR" ? "active-action" : ""}`}
              value="SOUVENIR"
              onClick={handleInput}
              >
              Souvenir
            </button>
          </div>

          <div className="form-end-start-container">
            <div className="when-buy">
              <h4>Item info:</h4>
              <input type="date" name="acquiredAt" value={data.acquiredAt} max={today} onChange={handleInput}/>
            </div>
            <div className="form-select-buttons">
              <div className="input-rel">
                <input type="text" id="itemName" name="name" className="input-field" 
                  value={itemInput} 
                  onChange={handleItemName}
                  disabled={sell ? true : false}
                  placeholder=" "
                  />
                <label htmlFor="itemName" className="input-label">Item Name</label>
              </div>
              <div className="input-rel">
                <input type="number" id="itemQuantity" className="input-field" name="quantity"
                value={data.quantity}
                onChange={handleInput}
                placeholder=" "
                min={1}/>
                <label htmlFor="itemQuantity" className="input-label">Qnt</label>
              </div>
            </div>
            <div className="form-select-buttons">
              <button type="button"
                name="wear" 
                className={`action-btn btn-default ${data.wear === "FN" ? "active-action" : ""}`}
                value="FN"
                onClick={handleInput}
              >
                FN
              </button>
              <button type="button"
                name="wear" 
                className={`action-btn btn-default ${data.wear === "MW" ? "active-action" : ""}`}
                value="MW"
                onClick={handleInput}
              >
                MW
              </button>
              <button type="button"
                name="wear" 
                className={`action-btn btn-default ${data.wear === "FT" ? "active-action" : ""}`}
                value="FT"
                onClick={handleInput}
              >
                FT
              </button>
              <button type="button" 
                name="wear" 
                className={`action-btn btn-default ${data.wear === "WW" ? "active-action" : ""}`}
                value="WW"
                onClick={handleInput}
              >
                WW
              </button>
              <button type="button" 
                name="wear" 
                className={`action-btn btn-default ${data.wear === "BS" ? "active-action" : ""}`}
                value="BS"
                onClick={handleInput}
              >
                BS
              </button> 
              <button type="button" 
                name="wear" 
                className={`action-btn btn-default ${data.wear === "NONE" ? "active-action" : ""}`}
                value="NONE"
                onClick={handleInput}
              >
                Other
              </button>    
            </div>
          </div>
        </div>
        
        <div className="input-rel">
          <input type="number" name="floatValue" id="floatVal" className="input-field"
            value={data.floatValue}
            onChange={handleInput}
            placeholder=" "/>
          <label htmlFor="floatVal" className="input-label">Float Value</label>
        </div>
        
        <button type="submit" className={`form-btn btn-default success-btn`}>
          {edit ? "Save" : "Create"}
        </button>
      </div>

      <div className="form-right-side">
        <div className="form-select-buttons">
          { sell ? (
            <Link to={`/same-transaction/${txId}`}
              className={`success-btn btn-default ${data.type === "BUY" ? "active-success" : ""}`}
            >
              Buy
            </Link>
          ) : (
            <button type="button"
            name="type"
            className={`success-btn btn-default ${data.type === "BUY" ? "active-success" : ""}`}
            value="BUY"
            onClick={handleInput}
            >
              Buy
            </button>
          )
          }
          {edit || same  ? (
            <Link to={`/sell-transaction/${txId}`}
              className={`danger-btn btn-default ${data.type === "SELL" ? "active-danger" : ""}`}
            >
              Sell
            </Link>
            )
            :
            (
              <button type="button"
                name="type"
                className={`danger-btn btn-default ${data.type === "SELL" ? "active-danger" : ""}`}
                value="SELL"
                onClick={handleInput}
              >
                Sell
              </button>
            )
          }
        </div>

        {sell && 
          <div className="roi-container">
            <p>Buy: {roiData.buyPrice}</p>
            <p>ROI: {roiData.roi.toFixed(2)}</p>
          </div>
        }
        <div className="form-end-start-container">
          <div className="input-rel">
            <input type="text" name="price" id="itemPrice" className="input-field" 
              value={priceInput}
              onChange={handleInput}
              placeholder=" "/>
            <label htmlFor="itemPrice" className="input-label">Enter Price</label>
          </div>
          <p>Total Price: {Number(data.price).toFixed(2)}</p>
        </div>
        <div className="form-select-buttons">
          <button type="button"
            name="itemCurrency"
            className={`action-btn btn-default ${data.itemCurrency === "UAH" ? "active-action" : ""}`}
            value="UAH"
            onClick={handleInput}
          >
            UAH
          </button>
          <button type="button"
            name="itemCurrency"
            className={`action-btn btn-default ${data.itemCurrency === "USD" ? "active-action" : ""}`}
            value="USD"
            onClick={handleInput}
          >
            USD
          </button>
          <button type="button"
            name="itemCurrency"
            className={`action-btn btn-default ${data.itemCurrency === "EUR" ? "active-action" : ""}`}
            value="EUR"
            onClick={handleInput}
          >
            EUR
          </button>
        </div>
        
      </div>
      {notification && (
          <Notification 
            key={notification.id}
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )
      }
    </form>
  )
}

export default TransactionForm