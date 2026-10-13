import React, { useEffect, useState } from "react";
import { api } from "../api/axios";
import { qualityTypes, exteriorTypes, floatValues } from "../types/transaction.types";
import { Link, useParams } from "react-router-dom";
import { calculation, roiCalculation } from "../utils/calculation";
import Notification from "../components/notification/Notification";
import type { MarketType } from "../types/market.types";
import "../styles/transaction/txFormStyles.css"
import axios from "axios";



function TransactionForm({edit = false, sell = false, same = false}) {
  const { txId } = useParams();
  const [markets, setMarkets] = useState<MarketType[]>([]);
  const [itemInput, setItemInput] = useState("");
  const [priceInput, setPriceInput] = useState("10");
  const [data, setData] = useState({
    itemName: "",
    quality: "Normal",
    exterior: "",
    floatValue: 0,
    price: 10,
    type: "BUY",
    quantity: 1,
    itemCurrency: "UAH",
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

    if(name === "quality") {
      let itemInputName = qualityTypes.includes(data.quality)
        ? itemInput.substring(data.quality.length + 1)
        : itemInput
      
      itemInputName = value !== "Normal" ? `${value} ${itemInputName}` : itemInputName
      setItemInput(itemInputName)
    }

    if(name === "exterior") {
      let itemInputName = exteriorTypes.includes(data.exterior ?? "") 
        ? itemInput.substring(0, itemInput.length - ((data.exterior?.length ?? 1) + 3)) 
        : itemInput
      
      itemInputName += value.length > 1 ? ` (${value})` : ""
      setItemInput(itemInputName)
      
      let exterior = exteriorTypes.includes(value) ? value : ""
      const floatValue = floatValues[value] ?? 0
      setData((prev) => ({
        ...prev,
        floatValue: floatValue,
        exterior,
      }))
      return
    }

    if(name === "price") {
      setPriceInput(value)
      const calc = calculation(value);
      const price = calc.newPrice;
      
      if(sell) {
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

    
    const exterior = item.substring(
      item.indexOf("(") + 1,
      item.lastIndexOf(")")
    );

    if(!exteriorTypes.includes(exterior)) {
      setData((prev) => ({
        ...prev,
        itemName: item,
        exterior: "",
        floatValue: 0
      }))
      return
    }


    const itemQuality = item.split(" ", 1).toString();

    const quality = qualityTypes.includes(itemQuality) ? itemQuality : "Normal";

    const startIndex = quality === "Normal" 
      ? item.indexOf(itemQuality)
      : item.indexOf(itemQuality) + itemQuality.length + 1

    if (!item.includes("(") || !item.includes(")")) {
      const itemName = item.substring(startIndex).trim()

      setData((prev) => ({
        ...prev,
        itemName: itemName,
        quality,
        floatValue: 0.06
      }))

      return;
    }

    const itemName = item.substring(
      startIndex,
      item.lastIndexOf(" (")
    ).trim()

    const float = floatValues[exterior] ?? 0;
    
    setData((prev) => ({
      ...prev,
      itemName: itemName,
      quality,
      exterior,
      floatValue: float
    }));
  };


  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const now = new Date()
    const acquiredAt = new Date(data.acquiredAt)
    acquiredAt.setHours(now.getHours())
    acquiredAt.setMinutes(now.getMinutes())

    const itemName = itemInput.replace(/\/+(?=[^\(\)]*\))/g, "-")
    
    const body = {
      item: {
        id: data.itemId,
        name: itemName.trim()
      },
      transaction: {
        floatValue: data.floatValue,
        price: Number(data.price),
        type: data.type,
        quantity: Number(data.quantity),
        itemCurrency: data.itemCurrency,

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
          quality: tx.item.quality,
          exterior: tx.item.exterior,
          floatValue: tx.floatValue,
          price: tx.price,
          type: tx.type,
          quantity: tx.quantity,
          itemCurrency: tx.itemCurrency,
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
          <div className="form-quality-buttons">
            <button type="button"
              name="quality"
              className={`action-btn btn-default ${data.quality == "Normal" ? "active-action" : ""}`}
              value="Normal"
              onClick={handleInput}
              >
              Normal
            </button>
            <button type="button"
              name="quality"
              className={`action-btn btn-default ${data.quality === "StatTrak™" ? "active-action" : ""}`}
              value="StatTrak™"
              onClick={handleInput}
              >
              StatTrak™
            </button>
            <button type="button"
              name="quality"
              className={`action-btn btn-default ${data.quality === "Souvenir" ? "active-action" : ""}`}
              value="Souvenir"
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
                name="exterior" 
                className={`action-btn btn-default ${data.exterior === "Factory New" ? "active-action" : ""}`}
                value="Factory New"
                onClick={handleInput}
              >
                FN
              </button>
              <button type="button"
                name="exterior" 
                className={`action-btn btn-default ${data.exterior === "Minimal Wear" ? "active-action" : ""}`}
                value="Minimal Wear"
                onClick={handleInput}
              >
                MW
              </button>
              <button type="button"
                name="exterior" 
                className={`action-btn btn-default ${data.exterior === "Field-Tested" ? "active-action" : ""}`}
                value="Field-Tested"
                onClick={handleInput}
              >
                FT
              </button>
              <button type="button" 
                name="exterior" 
                className={`action-btn btn-default ${data.exterior === "Well-Worn" ? "active-action" : ""}`}
                value="Well-Worn"
                onClick={handleInput}
              >
                WW
              </button>
              <button type="button" 
                name="exterior" 
                className={`action-btn btn-default ${data.exterior === "Battle-Scarred" ? "active-action" : ""}`}
                value="Battle-Scarred"
                onClick={handleInput}
              >
                BS
              </button> 
              <button type="button" 
                name="exterior" 
                className={`action-btn btn-default ${data.exterior === "" ? "active-action" : ""}`}
                value=""
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