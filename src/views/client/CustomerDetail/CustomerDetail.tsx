import { useState } from 'react'
import AdaptableCard from '@/components/shared/AdaptableCard'
import Container from '@/components/shared/Container'
import DoubleSidedImage from '@/components/shared/DoubleSidedImage'
import CustomerProfile from './components/CustomerProfile'
import PaymentHistory from './components/PaymentHistory'
import PaymentMethods from './components/PaymentMethods'
import CurrentSubscription from './components/CurrentSubscription'

type Customer = {
    id: string
    name: string
    email: string
    img: string
    personalInfo?: {
        phoneNumber: string
        location: string
        birthday: string
        title: string
        facebook: string
        twitter: string
        pinterest: string
        linkedIn: string
    }
}

const sampleCustomer: Customer = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    img: '/img/avatars/thumb-1.jpg',
    personalInfo: {
        phoneNumber: '+1 123 456 7890',
        location: 'New York, USA',
        birthday: '15/05/1990',
        title: 'Software Engineer',
        facebook: 'facebook.com/john.doe',
        twitter: 'twitter.com/john.doe',
        pinterest: 'pinterest.com/john.doe',
        linkedIn: 'linkedin.com/in/john.doe',
    }
}

const CustomerDetail = () => {
    const [customer, setCustomer] = useState(sampleCustomer)

    return (
        <Container className="h-full">
            <div className="flex flex-col xl:flex-row gap-4">
                <div>
                    <CustomerProfile 
                        data={customer} 
                    />
                </div>
                <div className="w-full">
                    <AdaptableCard>
                        {/* <CurrentSubscription /> */}
                        <PaymentHistory />
                        {/* <PaymentMethods /> */}
                    </AdaptableCard>
                </div>
            </div>
        </Container>
    )
}

export default CustomerDetail