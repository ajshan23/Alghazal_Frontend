import { fetchUserDetails, useAppDispatch, useAppSelector } from '@/store'
import { useEffect } from 'react'
import Input from '@/components/ui/Input'
import Avatar from '@/components/ui/Avatar'
import {
    HiOutlineUserCircle,
    HiOutlineMail,
    HiOutlineUser,
    HiOutlineShieldCheck, 
    HiOutlineCog,        
    HiOutlineCash,      
    HiOutlineTruck,      
    HiOutlineChip,    
    HiOutlineClipboardCheck,
    HiOutlinePhone
} from 'react-icons/hi'

const getRoleTitle = (role: string) => {
    switch(role) {
        case 'super_admin':
            return { title: 'Super Administrator', icon: <HiOutlineShieldCheck className="text-xl" /> }
        case 'admin':
            return { title: 'Administrator', icon: <HiOutlineShieldCheck className="text-xl" /> }
        case 'engineer':
            return { title: 'Engineer', icon: <HiOutlineCog className="text-xl" /> }
        case 'finance':
            return { title: 'Finance Officer', icon: <HiOutlineCash className="text-xl" /> }
        case 'driver':
            return { title: 'Driver', icon: <HiOutlineTruck className="text-xl" /> }
        case 'worker':
            return { title: 'Worker', icon: <HiOutlineChip className="text-xl" /> }
        case 'supervisor':
            return { title: 'Supervisor', icon: <HiOutlineClipboardCheck className="text-xl" /> }
        default:
            return { title: 'User', icon: <HiOutlineUser className="text-xl" /> }
    }
}

const Profile = () => {
    const dispatch = useAppDispatch()
    const { data: userData, loading, error } = useAppSelector((state) => state.userDetails)
    
    // Extract user object from nested response
    const user = userData?.data?.user

    useEffect(() => {
        dispatch(fetchUserDetails())
    }, [dispatch])

    if (loading) {
        return <div className="p-6 text-center">Loading profile...</div>
    }

    if (error) {
        return <div className="p-6 text-red-500">Error: {error}</div>
    }

    if (!user) {
        return <div className="p-6 text-center">No user data available</div>
    }

    const fullName = `${user.firstName} ${user.lastName}`.trim()
    const roleInfo = getRoleTitle(user.role)
    const primaryPhone = user.phoneNumbers?.[0] || 'No phone number'

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-6">Profile Information</h2>
            
            <div className="space-y-5">
                <div className="flex items-center space-x-4">
                    <Avatar
                        size={80}
                        shape="circle"
                        src={user.profileImage}
                        icon={<HiOutlineUser />}
                    />
                    <div>
                        <h3 className="text-lg font-semibold">
                            {fullName || 'No name'}
                        </h3>
                        <p className="text-gray-500">{roleInfo.title}</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <Input
                        readOnly
                        value={fullName}
                        prefix={<HiOutlineUserCircle className="text-xl" />}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input
                        readOnly
                        value={user.email || ''}
                        prefix={<HiOutlineMail className="text-xl" />}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <Input
                        readOnly
                        value={primaryPhone}
                        prefix={<HiOutlinePhone className="text-xl" />}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Role</label>
                    <Input
                        readOnly
                        value={roleInfo.title}
                        prefix={roleInfo.icon}
                    />
                </div>

                {user.signatureImage && (
                    <div>
                        <label className="block text-sm font-medium mb-1">Signature</label>
                        <img 
                            src={user.signatureImage} 
                            alt="User Signature" 
                            className="h-20 border rounded"
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

export default Profile