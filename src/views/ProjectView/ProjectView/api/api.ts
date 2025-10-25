import BaseService from "@/services/BaseService"


export const fetchProject = async (id:string) => {
    try {
        console.log("project data : ",id);
        
        const response = await BaseService.get(`/project/${id}`)
        console.log(response)
        return response.data

    } catch (error) {
        console.log(error)
        throw error
    }
}



export const fetchEngineers = async () => {
    try {
        // console.log("idddd",id);
        
        const response = await BaseService.get(`/user/engineers/`)
        console.log(response)
        return response.data

    } catch (error) {
        console.log(error)
        throw error
    }
}

// In api.ts
export const assignEngineer = async ({ 
    projectId, 
    engineerId 
    
  }: {
    projectId: string;
    engineerId: string;
  }) => {
    try {
        console.log(projectId,'project id')
        console.log(engineerId,'engineerId ')
      const response = await BaseService.post(`/project/${projectId}/assign`, {
        assignedTo:engineerId // Make sure this matches exactly what your backend expects
      });
      
      return response.data;
    } catch (error) {
      console.error("Assignment error details:", {
        error,
        response: error.response?.data
      });
      throw error;
    }
  };

  // api.ts
export const checkProject = async ({ 
  estimationId,
  isChecked,
  comment
}: {
  estimationId: string;
  isChecked: boolean;
  comment?: string;
}) => {
  try {
      // First verify the endpoint URL with your backend team
      const response = await BaseService.patch(`/estimation/${estimationId}/check`, {
          isChecked,
          comment
      });
      return response.data;
  } catch (error) {
      console.error("Error checking project:", {
          error,
          response: error.response?.data
      });
      throw error;
  }
};


export const Approvedproject = async ({ 
  estimationId,
  isApproved,
  comment
}: {
  estimationId: string;
  isApproved: boolean;
  comment?: string;
}) => {
  try {
      // First verify the endpoint URL with your backend team
      const response = await BaseService.patch(`/estimation/${estimationId}/approve`, {
          isApproved,
          comment
      });
      return response.data;
  } catch (error) {
      console.error("Error checking project:", {
          error,
          response: error.response?.data
      });
      throw error;
  }
};

export const fetchProjectActivities = async (id) => {
  try {
      const response = await BaseService.get(`/comment/${id}`)
      return response // Make sure this returns the full response object
  } catch (error) {
      console.log(error)
      throw error
  }
}

export const addProjectActivity = async (id,content) => {
  try {
      console.log("idddd",id);
      
      const response = await BaseService.post(`/comment/${id}`,{content})
      console.log(response)
      return response.data

  } catch (error) {
      console.log(error)
      throw error
  }
}