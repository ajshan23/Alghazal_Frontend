import BaseService from "@/services/BaseService"

export const apiGetDriverProjects = () => {
    return BaseService.get('/project/driver/assigned')
  }