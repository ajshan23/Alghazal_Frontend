import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import IconText from '@/components/shared/IconText'
import { HiMail, HiPhone, HiExternalLink, HiPhoneIncoming } from 'react-icons/hi'
import { Link } from 'react-router-dom'
import { FaMobile } from "react-icons/fa";


const CustomerInfo = ({ clientinformation: data }) => {
    return (
        <Card>
            <h5 className="mb-4">Customer</h5>
            <Link
                className="group flex items-center justify-between"
                to="/app/crm/customer-details?id=11"
            >
                <div className="flex items-center">
                    {/* <Avatar shape="circle" src={data?.img} /> */}
                    <div className="ltr:ml-2 rtl:mr-2">
                  
                        <span>
                          
                          
                            Name : {data?.client?.clientName}
                        </span>
                    </div>
                </div>
                <HiExternalLink className="text-xl hidden group-hover:block" />
            </Link>
            <hr className="my-5" />
            <IconText
                className="mb-4"
                icon={<HiMail className="text-xl opacity-70" />}
            >
                <span className="font-semibold">{data?.client?.email}</span>
            </IconText>
            <IconText icon={<FaMobile className="text-xl opacity-70" />}>
                <span className="font-semibold">{data?.client?.mobileNumber}</span>
            </IconText>
            <br />
             <IconText icon={<HiPhone className="text-xl opacity-70" />}>
                <span className="font-semibold">{data?.client?.telephoneNumber}</span>
            </IconText>
            <hr className="my-5" />
            <h6 className="mb-4">Shipping Address</h6>
            <address className="not-italic">
                <div className="mb-1">{data?.client?.clientAddress}</div>
            </address>
            {/* <hr className="my-5" /> */}
            {/* <h6 className="mb-4">Billing address</h6> */}
            {/* <address className="not-italic">
                <div className="mb-1">{data?.billingAddress.line1}</div>
                <div className="mb-1">{data?.billingAddress.line2}</div>
                <div className="mb-1">{data?.billingAddress.line3}</div>
                <div>{data?.billingAddress.line4}</div>
            </address> */}
        </Card>

        
    )
}

export default CustomerInfo
