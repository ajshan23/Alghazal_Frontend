// src/views/AttendanceDashboard/components/AttendanceStats.tsx
import Card from '@/components/ui/Card'
import { NumericFormat } from 'react-number-format'
import GrowShrinkTag from '@/components/shared/GrowShrinkTag'

interface AttendanceStatsProps {
    data: {
        totalEmployees: number
        totalPresent: number
        totalAbsent: number
        overallAttendance: number
    }
}

const AttendanceStats = ({ data }: AttendanceStatsProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
                <h6 className="font-semibold mb-4 text-sm">Total Employees</h6>
                <div className="flex justify-between items-center">
                    <h3 className="font-bold">
                        <NumericFormat
                            displayType="text"
                            value={data.totalEmployees}
                            thousandSeparator
                        />
                    </h3>
                </div>
            </Card>
            
            <Card>
                <h6 className="font-semibold mb-4 text-sm">Present Days</h6>
                <div className="flex justify-between items-center">
                    <h3 className="font-bold">
                        <NumericFormat
                            displayType="text"
                            value={data.totalPresent}
                            thousandSeparator
                        />
                    </h3>
                </div>
            </Card>
            
            <Card>
                <h6 className="font-semibold mb-4 text-sm">Absent Days</h6>
                <div className="flex justify-between items-center">
                    <h3 className="font-bold">
                        <NumericFormat
                            displayType="text"
                            value={data.totalAbsent}
                            thousandSeparator
                        />
                    </h3>
                </div>
            </Card>
            
            <Card>
                <h6 className="font-semibold mb-4 text-sm">Overall Attendance</h6>
                <div className="flex justify-between items-center">
                    <h3 className="font-bold">
                        <NumericFormat
                            displayType="text"
                            value={data.overallAttendance}
                            decimalScale={1}
                            suffix="%"
                        />
                    </h3>
                    <GrowShrinkTag 
                        value={data.overallAttendance} 
                        suffix="%" 
                    />
                </div>
            </Card>
        </div>
    )
}

export default AttendanceStats