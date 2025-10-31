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
    isPaidLeave?: boolean
}) => {
    return BaseService.post(`/attendance/project/${data.projectId}/user/${data.userId}`, {
        present: data.present,
        workingHours: data.hour || 0,
        type: 'project',
        isPaidLeave: data.isPaidLeave || false
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
    isPaidLeave?: boolean
}) => {
    return BaseService.post(`/attendance/normal/${data.userId}`, {
        present: data.present,
        workingHours: data.hour || 0,
        type: 'normal',
        isPaidLeave: data.isPaidLeave || false
    })
}

// Get user's monthly attendance
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

// Attendance Management APIs
export const apiCreateOrUpdateAttendance = (data: {
    userId: string;
    date: string;
    present: boolean;
    isPaidLeave?: boolean;
    workingHours?: number;
    type: 'project' | 'normal';
    projectId?: string;
}) => {
  return BaseService.post('/attendance-management/create-update', data);
}

export const apiDeleteAttendanceRecord = (attendanceId: string) => {
  return BaseService.delete(`/attendance-management/delete/${attendanceId}`);
}

export const apiGetUserProjects = (userId: string) => {
  return BaseService.get(`/attendance-management/user/${userId}/projects`);
}

// Get user's date-specific attendance
export const apiGetUserDateAttendance = (userId: string, date: string) => {
  return BaseService.get(`/attendance-management/user/${userId}/date`, {
    params: { date }
  });
}