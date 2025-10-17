import BaseService from "@/services/BaseService"

export const fetchShops = async ({ page, limit, search }) => {
    try {
        const response = await BaseService.get(`/shops`, {
            params: {
                page,
                limit,
                search, 
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching shops:', error);
        throw error;
    }
};
export const fetchShopsById = async (id: string) => {
    try {
        const response = await BaseService.get(`/shops/${id}`)

        console.log(response,"from singl")
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


export const addShop = async (formData: FormData) => {
    try {
        const response = await BaseService.post("/shops/", formData, {
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

export const editShop = async (id: string, formData: FormData) => {
    try {
        const response = await BaseService.put(`/shops/${id}`, formData, {
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

export const deleteShop = async (shopId: string) => {
    try {
        const response = await BaseService.delete(`/shops/${shopId}`)
        return response
    } catch (error) {
        console.error('Error deleting shop:', error)
        throw error
    }
}
