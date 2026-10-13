import { formatDate } from "../../utils/date";
import { useParams, Link } from "react-router-dom";
import { exteriorColor, exteriorCut, exteriorTypes, } from "../../types/transaction.types";
import { api } from "../../api/axios";
import { useEffect, useState } from "react";
import type { TransactionType } from "../../types/transaction.types";
import "../../styles/transaction/txCardStyles.css";
import "../../styles/transaction/txModalStyle.css";

function TransactionModal() {
  const [sourceTx, setSourceTx] = useState<TransactionType[]>([]);
  const [childrenTx, setChildrenTx] = useState<TransactionType[]>([]);

  const { txId } = useParams();

  async function getAllTxByID() {
    try {
      const res = await api.get(`/transaction/trade/${txId}`);
      const data = res.data.data;

      setSourceTx(data.sourceTx);
      setChildrenTx(data.childrenTx);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    if (txId) {
      getAllTxByID();
    }
  }, [txId]);

  if (!sourceTx) {
    return null;
  }

  let childrenPrice = 0

  return (
    <div className="transaction-modal">
      {sourceTx.map((source) => {

        const formattedBuyDate = formatDate(source.createdAt);
        const exterior = exteriorTypes.includes(source.item.exterior) ? source.item.exterior : "" 
        const extColor = exteriorColor[exterior]
        const exteriorFormat = exteriorCut[exterior]
        const itemName = exterior.length > 1 
          ? source.item.name.substring(0, source.item.name.length - (exterior.length + 3))
          : source.item.name
        const color = source.item.itemColor

        const imageUrl = source.item.imageUrl
          ? `https://community.akamai.steamstatic.com/economy/image/${source.item.imageUrl}`
          : null;

        let roi = 0

        if(childrenTx) {
          childrenTx.forEach(c => {
            if(c.roi !== null || c.roi !== undefined) {
              roi += Number(c.roi)
            }
          })
        }

        return (
          <div className="transaction-body" key={source.id}>
            <Link to={`/transactions`}>
              {`<-Back`}
            </Link>
            <div className="transaction-main">
              <div className="transaction-modal-image">
                <div
                  className="image-back-shadow"
                  style={{
                    boxShadow: `0px -5px 20px 35px #${color}`,
                    background: `#${color}`,
                  }}
                />
                {imageUrl ? 
                  (
                    <img src={imageUrl} alt={source.item.name}className="item-img"/>
                  ) : (
                    <span>{source.item.name}</span>
                )}
              </div>

              <div className="transaction-info">
                <p className="item-name">
                  <span className="item-exterior"style={{color: extColor}}>[{exteriorFormat}]</span>
                  {itemName}
                </p>
                <p>Float: {source.floatValue}</p>
                <p>ROI: {roi}%</p>
              </div>
            </div>

            <div className="transaction-info">
              <p>
                <strong>Transaction:</strong> {source.type}
              </p>
              <p>
                <strong>Market:</strong> {source.market.name}
              </p>
              <p>
                <strong>Quantity:</strong> {source.quantity}
              </p>
              <p>
                <strong>Price:</strong> {source.price}
              </p>
              <p>
                <strong>Status:</strong> {source.itemStatus}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {formattedBuyDate.time} {formattedBuyDate.date}
              </p>
            </div>
          </div>
        )
      })}

      {childrenTx.map((children) => {

        const formChilDate = formatDate(children.createdAt);
        console.log(formChilDate.time)
        childrenPrice += children.price
        return (
          <div
            className="transaction-body transaction-children"
            key={children.id}
          >
            <div className="transaction-info">
              <p>
                <strong>Transaction:</strong>{" "}{children.type}
              </p>
              <p>
                <strong>Market:</strong>{" "}{children.market.name}
              </p>
              <p>
                <strong>Quantity:</strong>{" "}{children.quantity}
              </p>
              <p>
                <strong>Price:</strong>{" "}{children.price}
              </p>
              <p>
                <strong>ROI:</strong>{" "}{children.roi ?? 0}%
              </p>
              <p>
                <strong>Status:</strong>{" "}{children.itemStatus}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {formChilDate.time}{" "}
                {formChilDate.date}
              </p>
            </div>
          </div>
        );
      })}

    </div>
  );
}

export default TransactionModal;
