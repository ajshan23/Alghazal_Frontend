import BaseService from "@/services/BaseService"
export const fetchUser = async (params?: { 
    page?: number; 
    limit?: number; 
    search?: string 
}) => {
    try {
        // Build query parameters
        const queryParams = new URLSearchParams()
        
        if (params?.page) {
            queryParams.append('page', params.page.toString())
        }
        
        if (params?.limit) {
            queryParams.append('limit', params.limit.toString())
        }
        
        if (params?.search && params.search.trim()) {
            queryParams.append('search', params.search.trim())
        }
        
        // Construct the URL with query parameters
        const url = `/user${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
        
        const response = await BaseService.get(url)
        return response.data
    } catch (error) {
        console.error('Error fetching user:', error)
        throw error
    }
}

export const fetchUserById = async (id: string) => {
    try {
        const response = await BaseService.get(`/user/${id}`)
        return {
            ...response.data,
            phoneNumbers: Array.isArray(response.data.phoneNumbers) 
                ? response.data.phoneNumbers 
                : [response.data.phoneNumbers || ''],
            profileImage: response.data.profileImage || '',
            signatureImage: response.data.signatureImage || '',
            emiratesIdDocument: response.data.emiratesIdDocument || '',
            passportDocument: response.data.passportDocument || ''
        }
    } catch (error) {
        console.error('Error fetching user:', error)
        throw error
    }
}

export const editUser = async (id: string, formData: FormData) => {
    try {
        const response = await BaseService.put(`/user/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response
    } catch (error) {
        console.error('Error editing user:', error)
        throw error
    }
}

export const addUser = async (formData: FormData) => {
    try {
        const response = await BaseService.post("/user", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response
    } catch (error) {
        console.error('Error adding user:', error)
        throw error
    }
}

export const fetchUserView = async (id: string) => {
    try {
        const response = await BaseService.get(`/user/${id}`)
        return response.data
    } catch (error) {
        console.error('Error fetching user:', error)
        throw error
    }
}

// Add this to your api.ts file
export const exportUsersToCSV = async () => {
    try {
        const response = await BaseService.get('/user/export/csv', {
            responseType: 'blob', // Important for file downloads
        })
        return response.data
    } catch (error) {
        console.error('Error exporting users:', error)
        throw error
    }
}