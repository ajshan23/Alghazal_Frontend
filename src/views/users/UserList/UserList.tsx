import reducer from './store'
import { injectReducer } from '@/store'
import AdaptableCard from '@/components/shared/AdaptableCard'
import UserTable from './components/UserTable'
import UserTableTools from './components/UserTableTools'

injectReducer('salesProductList', reducer)

const UserList = () => {
    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="lg:flex items-center justify-between mb-4">
                <h3 className="mb-4 lg:mb-0">Staffs</h3>
                <UserTableTools />
            </div>
            <UserTable />
        </AdaptableCard>
    )
}

export default UserList
