import BaseService from "@/services/BaseService"


export const fetchClients = async (params?: {
    page?: number
    limit?: number
    search?: string
}) => {
    try {
        const response = await BaseService.get("/client", { params })
        console.log(response.data)
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

type FormDataApi={
  projectName: string
  projectDescription: string
  siteAddress: string
  siteLocation: string
  client:string
}
export const createProject = async (data:FormDataApi) => {
    try {
        const response = await BaseService.post("/project",data)
        return response
    } catch (error) {
        console.log(error)
        throw error
    }
}

export const fetchProjectList = async (params?: {
    page?: number
    limit?: number
    search?: string
}) => {
    try {
        const response = await BaseService.get("/project/engineer", { params })
        console.log(response)
        return response.data

    } catch (error) {
        console.log(error)
        throw error
    }
}


export const fetchProjectById = async (id: string) => {
    try {
        console.log(`Fetching Project with ID: ${id}`)
        const response = await BaseService.get(`/project/${id}`)
        console.log('Project fetch response:', response)
        return response.data
    } catch (error) {
        console.error('Error fetching Project:', error)
        throw error
    }
}

export const editProject = async (id: string, values: FormDataApi) => {
    try {
        console.log(`Editing Project with ID: ${id}`, values)
        const response = await BaseService.put(`/project/${id}`, values)
        console.log('Edit response:', response)
        return response
    } catch (error) {
        console.error('Error editing Project:', error)
        throw error
    }
}



