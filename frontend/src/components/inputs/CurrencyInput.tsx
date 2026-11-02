import "../../styles/fields/currencyInput.css"

type CurrencyInputProps = {
  field: {name: string, text: string, width?: string, type: "number" | "text", currencyName: string};
  price: string;
  totalPrice?: number;
  currency: string;
  priceInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currencyButton: (e: React.MouseEvent<HTMLButtonElement>) => void;
  form: "Transaction" | "Goal"
};


export function CurrencyInput({
  field,
  price,
  totalPrice,
  currency,
  priceInput,
  currencyButton,
  form
}: CurrencyInputProps) {
  let inputWidth
  if(field.width) {
    inputWidth = {
      width: field.width
    }
  }

  return (
    <div className="currency-input-container">
      <div className="input-rel">
        <input
          type={field.type}
          name={field.name}
          id={field.name}
          className="input-field"
          style={inputWidth}
          value={price}
          onChange={priceInput}
          placeholder=" "
        />
        <label htmlFor={field.name} className="input-label">
          {field.text}
        </label>
      </div>
      {form === "Transaction" && totalPrice && (
        <p>Total Price: {Number(totalPrice).toFixed(2)}</p>
      )}

      <div className="currency-select-buttons">
        {(["UAH", "USD", "EUR"] as const).map((code) => (
          <button
            key={code}
            name={field.currencyName}
            type="button"
            value={code}
            className={`action-btn btn-default ${
              currency === code ? "active-action" : ""
            }`}
            onClick={currencyButton}
          >
            {code}
          </button>
        ))}
      </div>
    </div>
  );
}