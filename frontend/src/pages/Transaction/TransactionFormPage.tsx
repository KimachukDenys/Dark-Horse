import { useParams } from "react-router-dom";
import TransactionForm from "../../forms/TransactionForm";



function TransactionFormPage({same = false, edit = false, sell = false}) {
  const { txId } = useParams()
  const header = () => {
    if(edit && txId) {
      return (
        <h2 className="page-header">Edit Transaction #{txId}</h2>
      )
    } else if(sell && txId) {
      return (
        <h2 className="page-header">Sell Transaction #{txId}</h2>
      )
    }
    return (
      <h2 className="page-header">Create Transaction</h2>
    )
  }

  return (
    <div className="form-container">
      {header()}
      <TransactionForm same={same} edit={edit} sell={sell}/>
    </div>
  )
}


export default TransactionFormPage