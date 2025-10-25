import BaseService from "@/services/BaseService"

// Project Attendance APIs
export const apiGetTodayProjectAttendance = (projectId: string) => {
    return BaseService.get(`/attendance/project/${projectId}/today`)
}

export const apiMarkAttendance = (data: {
    projectId: string
    userId: string
    present: boolean
    hour?: number
}) => {
    return BaseService.post(`/attendance/project/${data.projectId}/user/${data.userId}`, {
        present: data.present,
        workingHours: data.hour || 0, // FIXED: Changed from workingHour to workingHours
        type: 'project'
    })
}

export const apiGetAttendanceSummary = (projectId: string, params = {}) => {
    return BaseService.get(`/attendance/project/${projectId}/summary`, { params })
}

// Normal Attendance APIs
export const apiMarkNormalAttendance = (data: {
    userId: string
    present: boolean
    date?: Date
    type?: 'normal'
    hour?: number
}) => {
    return BaseService.post(`/attendance/normal/${data.userId}`, {
        present: data.present,
        workingHours: data.hour || 0, // FIXED: Changed from workingHour to workingHours
        type: 'normal'
    })
}

// FIXED: Get user's monthly attendance with proper API endpoint
export const apiGetUserMonthlyAttendance = (
    userId: string,
    month: number,
    year: number,
    type: 'all' | 'project' | 'normal' = 'all'
) => {
    return BaseService.get(`/attendance/user/${userId}/monthly`, {
        params: { month, year, type }
    })
}

// Keep the old function for backward compatibility but use the new endpoint
export const apiGetNormalMonthlyAttendance = (
    userId: string,
    month: number,
    year: number
) => {
    return BaseService.get(`/attendance/normal/monthly/${userId}`, {
        params: { month, year }
    })
}

export const apiGetDailyNormalAttendance = (date: string) => {
    return BaseService.get('/attendance/normal/daily', {
        params: { date }
    })
}

// User APIs
export const apiGetUsers = (params?: {
    limit?: number
    page?: number
    search?: string
    role?: string
}) => {
    return BaseService.get('/user', { params })
}

// Analytics APIs
export const fetchOverviewStats = async (params: { 
  period?: string; 
  year?: string 
}) => {
  const response = await BaseService.get(`/analytics/overview`, {
    params,
    withCredentials: true
  });
  return response.data.data;
};

export const fetchEmployeeTrend = async (
  employeeId: string, 
  params: { months?: string }
) => {
  const response = await BaseService.get(`/analytics/employee/${employeeId}`, {
    params,
    withCredentials: true
  });
  return response.data.data;
};

export const fetchAllProjectsAnalytics = async (params: {
  period?: string;
  year?: string
}) => {
  const response = await BaseService.get(`/analytics/projects`, {
    params,
    withCredentials: true
  });
  return response.data.data;
};

export const fetchProjectAnalytics = async (
  projectId: string,
  params: {
    period?: string;
    year?: string
  }
) => {
  const response = await BaseService.get(`/analytics/projects/${projectId}`, {
    params,
    withCredentials: true
  });
  return response.data.data;
};

export const apiCreateOrUpdateAttendance = (data) => {
  return BaseService.post('/attendance-management/create-update', data);
}

// Delete attendance
export const apiDeleteAttendanceRecord = (attendanceId) => {
  return BaseService.delete(`/attendance-management/delete/${attendanceId}`);
}

// Get user's projects for dropdown
export const apiGetUserProjects = (userId) => {
  return BaseService.get(`/attendance-management/user/${userId}/projects`);
}