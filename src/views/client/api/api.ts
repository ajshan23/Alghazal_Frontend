import BaseService from "@/services/BaseService"

export const createClient = async (values: any) => {
    try {
        const response = await BaseService.post("/client", values)
        console.log("response:",response);
        
        return response
    } catch (error: any) {
        if (error.response && error.response.data) {
            throw new Error(error.response.data.message || 'Failed to create client')
        }
        throw new Error('Failed to create client')
    }
}

export const fetchClients = async (params?: {
    page?: number
    limit?: number
    search?: string
}) => {
    try {
        const response = await BaseService.get("/client", { params })
        return response.data
    } catch (error) {
        console.log(error)
        throw error
    }
}

export const fetchClient = async (params?: {
    page?: number
    limit?: number
    search?: string
}) => {
    try {
        const response = await BaseService.get("/client", { params })
        return response.data
    } catch (error) {
        console.log(error)
        throw error
    }
}

export const deleteClient = async (id: string) => {
    try {
        const response = await BaseService.delete(`/client/${id}`)
        return response.data.success
    } catch (error) {
        console.log(error)
        throw error
    }
}

export const fetchClientById = async (id: string) => {
    try {
        const response = await BaseService.get(`/client/${id}`)
        return response.data
    } catch (error) {
        console.error('Error fetching client:', error)
        throw error
    }
}

export const editClient = async (id: string, values: any) => {
    try {
        const response = await BaseService.put(`/client/${id}`, values)
        return response
    } catch (error) {
        console.error('Error editing client:', error)
        throw error
    }
}


export const fetchClienView = async (id: string) => {
    try {
        const response = await BaseService.get(`/client/${id}`)
        return response.data
    } catch (error) {
        console.error('Error fetching client:', error)
        throw error
    }
}