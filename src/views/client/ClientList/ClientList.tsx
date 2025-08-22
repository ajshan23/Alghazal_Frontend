import reducer from './store'
import { injectReducer } from '@/store'
import AdaptableCard from '@/components/shared/AdaptableCard'
import ClientTable from './components/ClientTable'
import ClientTableTools from './components/ClientTableTools'

injectReducer('salesClientList', reducer)

const ClientList = () => {
    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="lg:flex items-center justify-between mb-4">
                <h3 className="mb-4 lg:mb-0">Clients</h3>
                <ClientTableTools />
            </div>
            <ClientTable />
        </AdaptableCard>
    )
}

export default ClientList