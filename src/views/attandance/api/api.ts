import BaseService from "@/services/BaseService"

// Project Attendance APIs
export const apiGetTodayProjectAttendance = (projectId: string) => {
    return BaseService.get(`/attandance/project/${projectId}/today`)
}

export const apiMarkAttendance = (data: {
    projectId: string
    userId: string
    present: boolean
    hour?: number
}) => {
    return BaseService.post(`/attandance/project/${data.projectId}/user/${data.userId}`, {
        present: data.present,
        workingHour: data.hour
    })
}

export const apiGetAttendanceSummary = (projectId: string, params = {}) => {
    return BaseService.get(`/attandance/project/${projectId}/summary`, { params })
}

// Normal Attendance APIs
export const apiMarkNormalAttendance = (data: {
    userId: string
    present: boolean
    date?: Date
    type?: 'normal'
    hour?: number
}) => {
    return BaseService.post(`/attandance/normal/${data.userId}`, {
        ...data,
        type: 'normal',
        workingHour: data.hour
    })
}

export const apiGetUserMonthlyAttendance = (
    userId: string,
    month: number,
    year: number
) => {
    return BaseService.get(`/attandance/normal/monthly/${userId}`, {
        params: { month, year }
    })
}

export const apiGetDailyNormalAttendance = (date: string) => {
    return BaseService.get('/attandance/normal/daily', {
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
// Overview stats
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

// Employee trend
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

// All projects analytics
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

// Single project analytics
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