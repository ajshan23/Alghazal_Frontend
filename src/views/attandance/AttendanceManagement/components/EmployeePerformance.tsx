// src/views/attendance/components/EmployeePerformance.tsx
import { Card, Table, Avatar, Badge } from '@/components/ui';
import { NumericFormat } from 'react-number-format';

interface EmployeePerformanceProps {
  topPerformers: Array<{
    id: string;
    name: string;
    attendanceRate: number;
  }>;
  bottomPerformers: Array<{
    id: string;
    name: string;
    attendanceRate: number;
  }>;
}

const { Tr, Th, Td, THead, TBody } = Table;

const EmployeePerformance = ({ topPerformers, bottomPerformers }: EmployeePerformanceProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <h4 className="font-bold mb-4">Top Performers</h4>
        <Table>
          <THead>
            <Tr>
              <Th>Employee</Th>
              <Th>Attendance</Th>
            </Tr>
          </THead>
          <TBody>
            {topPerformers.map((employee) => (
              <Tr key={`top-${employee.id}`}>
                <Td>
                  <div className="flex items-center gap-2">
                    <Avatar shape="circle" src="/img/avatars/thumb-1.jpg" />
                    <span>{employee.name}</span>
                  </div>
                </Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-500" />
                    <NumericFormat
                      displayType="text"
                      value={employee.attendanceRate}
                      decimalScale={1}
                      suffix="%"
                    />
                  </div>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </Card>

      <Card>
        <h4 className="font-bold mb-4">Needs Improvement</h4>
        <Table>
          <THead>
            <Tr>
              <Th>Employee</Th>
              <Th>Attendance</Th>
            </Tr>
          </THead>
          <TBody>
            {bottomPerformers.map((employee) => (
              <Tr key={`bottom-${employee.id}`}>
                <Td>
                  <div className="flex items-center gap-2">
                    <Avatar shape="circle" src="/img/avatars/thumb-2.jpg" />
                    <span>{employee.name}</span>
                  </div>
                </Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-red-500" />
                    <NumericFormat
                      displayType="text"
                      value={employee.attendanceRate}
                      decimalScale={1}
                      suffix="%"
                    />
                  </div>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </Card>
    </div>
  );
};

export default EmployeePerformance;