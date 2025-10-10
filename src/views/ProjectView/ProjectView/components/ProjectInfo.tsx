import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import IconText from '@/components/shared/IconText'
import { HiLocationMarker, HiOutlineGlobe, HiInformationCircle } from 'react-icons/hi'


const ProjectInfo = ({ projectdetails: data }) => {
    return (
        <Card>
            <h5 className="mb-4">Project Details</h5>
            <div className="flex items-center">
                <div className="ltr:ml-2 rtl:mr-2">
                    <div className="font-semibold text-lg">{data?.projectName}</div>
                    <div className="font-semibold text-lg">{data?.projectNumber}</div>
                    
                </div>
            </div>
            
            <hr className="my-5" />
            
            <h6 className="mb-3">Project Description</h6>
            <div className="flex items-start mb-5">
                <HiInformationCircle className="text-xl opacity-70 mt-1 mr-2" />
                <p className="text-gray-700">{data?.projectDescription
 || 'No description provided'}</p>
            </div>
            
            <hr className="my-5" />
            
            <h6 className="mb-3">Site Information</h6>
            <div className="space-y-4">
                <IconText icon={<HiLocationMarker className="text-xl opacity-70" />}>
                    <div>
                        <div className="font-semibold">Site Location</div>
                        <div className="text-gray-700">{data?.location || 'Not specified'}</div>
                    </div>
                </IconText>
                
                <IconText icon={<HiOutlineGlobe className="text-xl opacity-70" />}>
                    <div>
                        <div className="font-semibold">Building</div>
                        <div className="text-gray-700">{data?.building || 'Not specified'}</div>
                    </div>
                </IconText>
                 <IconText icon={<HiOutlineGlobe className="text-xl opacity-70" />}>
                    <div>
                        <div className="font-semibold">Apartment</div>
                        <div className="text-gray-700">{data?.apartmentNumber || 'Not specified'}</div>
                    </div>
                </IconText>
            </div>
            
            {data?.client && (
                <>
                    <hr className="my-5" />
                    <h6 className="mb-3">Client Information</h6>
                    <div className="space-y-2">
                        <div>
                            <span className="font-semibold">Name: </span>
                            <span>{data?.client?.clientName}</span>
                        </div>
                        <div>
                            <span className="font-semibold">Address: </span>
                            <span>{data?.client?.clientAddress}</span>
                        </div>
                        <div>
                            <span className="font-semibold">Phone: </span>
                            <span>{data?.client?.mobileNumber}</span>
                        </div>
                    </div>
                </>
            )}
        </Card>
    )
}

export default ProjectInfo