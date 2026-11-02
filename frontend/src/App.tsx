import NavBar from "./components/main/navBar";
import { WalletContextProvider } from "./hooks/wallet.context";
import AuthProvider from "./hooks/auth.context";
import "./styles/fonts.css"
import "./styles/reset.css"
import "./styles/global.css"
import "./styles/button.css"
import "./styles/input.css"


function App() {


  return (
    <AuthProvider> 
      <WalletContextProvider>
        <div>
          <NavBar />
        </div>
      </WalletContextProvider>
    </AuthProvider>
  );
}

export default App;