// src/views/AttendanceDashboard/components/AttendanceDashboardBody.tsx
import Loading from '@/components/shared/Loading'
import AttendanceStats from './AttendanceStats'
import AttendanceTrendChart from './AttendanceTrendChart'
import EmployeePerformance from './EmployeePerformance'
import ProjectAttendance from './ProjectAttendance'


interface AttendanceDashboardBodyProps {
    loading: boolean
    data: {
        overviewStats: any
        employeeTrend: any
        projectAnalytics: any
    }
}

const AttendanceDashboardBody = ({ loading, data }: AttendanceDashboardBodyProps) => {
    return (
        <Loading loading={loading}>
            <div className="grid grid-cols-1 gap-4">
                {/* Overview Statistics */}
                {data.overviewStats && (
                    <AttendanceStats data={data.overviewStats} />
                )}
                
                {/* Attendance Trends */}
                {data.overviewStats?.monthlyTrend && (
                    <AttendanceTrendChart 
                        data={data.overviewStats.monthlyTrend} 
                    />
                )}
                
                {/* Employee Performance */}
                {data.overviewStats?.topPerformers && (
                    <EmployeePerformance 
                        topPerformers={data.overviewStats.topPerformers}
                        bottomPerformers={data.overviewStats.bottomPerformers}
                    />
                )}
                
                {/* Project Analytics */}
                {data.projectAnalytics && (
                    <ProjectAttendance 
                        data={data.projectAnalytics} 
                    />
                )}
            </div>
        </Loading>
    )
}

export default AttendanceDashboardBody