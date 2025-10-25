import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import {
    FaFacebookF,
    FaTwitter,
    FaLinkedinIn,
    FaPinterestP,
} from 'react-icons/fa'
import { HiPencilAlt, HiOutlineTrash } from 'react-icons/hi'
import { useNavigate, useParams } from 'react-router-dom'
import EditCustomerProfile from './EditCustomerProfile'
import { fetchClienView } from '../../api/api'

type CustomerInfoFieldProps = {
    title?: string
    value?: string
}

type CustomerProfileProps = {
    data?: Partial<Customer>
}

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

// Sample data
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

const CustomerInfoField = ({ title, value }: CustomerInfoFieldProps) => {
    return (
        <div>
            <span>{title}</span>
            <p className="text-gray-700 dark:text-gray-200 font-semibold">
                {value}
            </p>
        </div>
    )
}







const CustomerProfile = () => {
    
    const [data,setData]=useState({})

    useEffect(()=>{
        fetchData()
    },[])

    const {id}=useParams()

    const fetchData=async()=>{
        const response =await fetchClienView(id);
        console.log(response,"data: ")
        setData({
            email:response?.data?.email,
            clientName:response?.data?.clientName,
            clientAddress:response?.data?.clientAddress,
            pincode:response?.data?.pincode,
            mobileNumber:response?.data?.mobileNumber,
            telephoneNumber:response?.data?.telephoneNumber,
            trnNumber:response?.data?.trnNumber,
            accountNumber:response?.data?.accountNumber,
        })
    }

    return (
        <Card>
            <div className="flex flex-col xl:justify-between h-full 2xl:min-w-[360px] mx-auto">
                <div className="flex xl:flex-col items-center gap-4">
                    <Avatar size={90} shape="circle" src={data.img} />
                    <h4 className="font-bold">{data?.clientName}</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-y-7 gap-x-4 mt-8">
                    <CustomerInfoField
                        title="Client Name"
                        value={data?.clientName}
                    />
                    <CustomerInfoField title="Email" value={data?.email || 'email'} />
                    <CustomerInfoField
                        title="Phone"
                        value={data?.mobileNumber}
                    />
                    <CustomerInfoField
                        title="Location"
                        value={data?.clientAddress}
                    />
                    <CustomerInfoField
                        title="Trn Number"
                        value={data?.trnNumber}
                    />
                    <CustomerInfoField
                        title="Account Number"
                        value={data?.accountNumber || 'number'}
                    />
                    
                    <CustomerInfoField
                        title="Pincode"
                        value={data?.pincode}
                    />
                   
                </div>
            </div>
        </Card>
    )
}

export default CustomerProfile