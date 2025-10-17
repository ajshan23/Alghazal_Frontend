import reducer from './store'
import { injectReducer } from '@/store'
import Wallet from './components/ProjectView'
import TransactionHistory from './components/TransactionHistory'

injectReducer('cryptoWallets', reducer)

const Wallets = () => {
    return (
        <div className="flex flex-col gap-4">
            <Wallet />
        </div>
    )
}

export default Wallets
