// src/views/attendance/AttendanceDashboard.tsx
import { Card, Progress, Table, Avatar, Badge } from '@/components/ui';
import { NumericFormat } from 'react-number-format';

const AttendanceDashboard = () => {
  // Sample data
  const overviewStats = {
    totalEmployees: 42,
    totalPresent: 856,
    totalAbsent: 144,
    overallAttendance: 85.6,
    monthlyTrend: [
      { month: 1, attendanceRate: 82 },
      { month: 2, attendanceRate: 84 },
      { month: 3, attendanceRate: 86 },
      { month: 4, attendanceRate: 85 },
      { month: 5, attendanceRate: 87 },
      { month: 6, attendanceRate: 88 }
    ],
    topPerformers: [
      { id: '1', name: 'John Doe', attendanceRate: 98 },
      { id: '2', name: 'Jane Smith', attendanceRate: 97 },
      { id: '3', name: 'Mike Johnson', attendanceRate: 96 }
    ],
    bottomPerformers: [
      { id: '4', name: 'Sarah Williams', attendanceRate: 72 },
      { id: '5', name: 'David Brown', attendanceRate: 75 },
      { id: '6', name: 'Emily Davis', attendanceRate: 78 }
    ]
  };

  const projects = [
    { id: '1', name: 'Office Renovation', attendanceRate: 88, present: 220, total: 250 },
    { id: '2', name: 'Client Website', attendanceRate: 82, present: 205, total: 250 },
    { id: '3', name: 'Mobile App', attendanceRate: 91, present: 227, total: 250 }
  ];

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold">Attendance Dashboard</h3>
          <p className="text-gray-500">Sample data preview</p>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Employees', value: overviewStats.totalEmployees },
          { title: 'Present Days', value: overviewStats.totalPresent },
          { title: 'Absent Days', value: overviewStats.totalAbsent },
          { 
            title: 'Overall Attendance', 
            value: overviewStats.overallAttendance,
            progress: overviewStats.overallAttendance 
          }
        ].map((stat, index) => (
          <Card key={index} className="p-4">
            <h4 className="font-semibold text-gray-500 text-sm mb-2">
              {stat.title}
            </h4>
            <div className="flex items-end justify-between">
              <h3 className="font-bold text-2xl">
                <NumericFormat
                  displayType="text"
                  value={stat.value}
                  thousandSeparator
                  suffix={stat.progress ? '%' : ''}
                />
              </h3>
            </div>
            {stat.progress && (
              <Progress
                className="mt-2"
                percent={stat.progress}
                color="blue-500"
              />
            )}
          </Card>
        ))}
      </div>

      {/* Employee Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h4 className="font-bold mb-4">Top Performers</h4>
          <Table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Attendance</th>
              </tr>
            </thead>
            <tbody>
              {overviewStats.topPerformers.map((employee) => (
                <tr key={`top-${employee.id}`}>
                  <td>
                    <div className="flex items-center gap-2">
                      <Avatar shape="circle" src="/img/avatars/thumb-1.jpg" />
                      <span>{employee.name}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-500" />
                      <NumericFormat
                        displayType="text"
                        value={employee.attendanceRate}
                        decimalScale={1}
                        suffix="%"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <Card>
          <h4 className="font-bold mb-4">Needs Improvement</h4>
          <Table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Attendance</th>
              </tr>
            </thead>
            <tbody>
              {overviewStats.bottomPerformers.map((employee) => (
                <tr key={`bottom-${employee.id}`}>
                  <td>
                    <div className="flex items-center gap-2">
                      <Avatar shape="circle" src="/img/avatars/thumb-2.jpg" />
                      <span>{employee.name}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-500" />
                      <NumericFormat
                        displayType="text"
                        value={employee.attendanceRate}
                        decimalScale={1}
                        suffix="%"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>

      {/* Project Attendance */}
      <Card>
        <h4 className="font-bold mb-4">Project Attendance</h4>
        <Table>
          <thead>
            <tr>
              <th>Project</th>
              <th>Attendance Rate</th>
              <th>Present</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td>{project.name}</td>
                <td>
                  <div className="flex items-center gap-3">
                    <Progress 
                      percent={project.attendanceRate} 
                      color="blue-500"
                      className="w-20"
                    />
                    <NumericFormat
                      displayType="text"
                      value={project.attendanceRate}
                      decimalScale={1}
                      suffix="%"
                    />
                  </div>
                </td>
                <td>{project.present}</td>
                <td>{project.total}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};

export default AttendanceDashboard;