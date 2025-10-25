import BaseService from "@/services/BaseService";

interface ProgressUpdateData {
  projectId: string;
  progress: number;
  comment: string;
}

interface ProgressUpdate {
  _id: string;
  content: string;
  progress: number;
  actionType: string;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
}


export const apiGetProjectProgressUpdates = async (projectId: string): Promise<{ data: ProgressUpdate[] }> => {
  try {
    const response = await BaseService.get(`/project/${projectId}/progress`);
    return response.data;
  } catch (error) {
    console.error("Error fetching progress updates:", error);
    throw error;
  }
}

export const apiPostProjectProgressUpdate = async (data: ProgressUpdateData): Promise<{ data: ProgressUpdate }> => {
  try {
    const response = await BaseService.patch(`/project/${data.projectId}/progress`, {
      progress: data.progress,
      comment: data.comment
    });
    return response.data;
  } catch (error) {
    console.error("Error posting progress update:", error);
    throw error;
  }
}

export const apiGetProjectCurrentProgress = async (projectId: string): Promise<{ data: { progress: number } }> => {
  try {
    const response = await BaseService.get(`/project/${projectId}`);
    return { data: { progress: response.data.progress || 0 } };
  } catch (error) {
    console.error("Error fetching current project progress:", error);
    throw error;
  }
}


export const apiUpdateProjectProgress = async (projectId: string, progress: number): Promise<{ data: { progress: number } }> => {
  try {
    const response = await BaseService.patch(`/project/${projectId}/progress`, { progress });
    return response.data;
  } catch (error) {
    console.error("Error updating project progress:", error);
    throw error;
  }
}


// In your api.ts
export const apiGetProjectDetails = async (projectId: string) => {
  return BaseService.get(`/project/${projectId}`);
};

export const apiGetAvailableEngineers = async () => {
  return BaseService.get('/user/workers');
};

export const apiGetAvailableDrivers = async () => {
  return BaseService.get('/user/drivers');
};

export const apiAssignTeamToProject = async (projectId: string, data: {
  workers: string[];
  driverId: string;
}) => {
  return BaseService.post(`/project/${projectId}/assign-team`, data);
};

// Add to your api.ts file
export const apiGetAssignedTeam = (projectId: string) => {
  return BaseService.get(`/project/${projectId}/team`);
};