// src/views/attendance/components/ProjectAnalytics.tsx
import { useState } from 'react';
import { Card, Table, Button, Progress } from '@/components/ui';
import { NumericFormat } from 'react-number-format';

interface ProjectAnalyticsProps {
  projects: Array<{
    id: string;
    name: string;
    attendanceRate: number;
    present: number;
    total: number;
  }>;
  selectedProject: any;
  onSelectProject: (projectId: string) => void;
}

const { Tr, Th, Td, THead, TBody } = Table;

const ProjectAnalytics = ({ 
  projects, 
  selectedProject,
  onSelectProject 
}: ProjectAnalyticsProps) => {
  const [view, setView] = useState<'list' | 'detail'>('list');

  return (
    <Card>
      {view === 'list' ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold">Project Attendance</h4>
            <div className="flex gap-2">
              <Button size="sm" variant="plain">
                Export
              </Button>
            </div>
          </div>
          <Table>
            <THead>
              <Tr>
                <Th>Project</Th>
                <Th>Attendance Rate</Th>
                <Th>Present</Th>
                <Th>Total</Th>
                <Th>Actions</Th>
              </Tr>
            </THead>
            <TBody>
              {projects?.map((project) => (
                <Tr key={project.id}>
                  <Td>{project.name}</Td>
                  <Td>
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
                  </Td>
                  <Td>{project.present}</Td>
                  <Td>{project.total}</Td>
                  <Td>
                    <Button
                      size="xs"
                      onClick={() => {
                        onSelectProject(project.id);
                        setView('detail');
                      }}
                    >
                      Details
                    </Button>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold">
              Project: {selectedProject?.name}
            </h4>
            <Button
              size="sm"
              onClick={() => setView('list')}
            >
              Back to List
            </Button>
          </div>
          {selectedProject && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <h5 className="font-semibold mb-4">Attendance Overview</h5>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-500">Start Date</p>
                    <p>{new Date(selectedProject.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">End Date</p>
                    <p>{new Date(selectedProject.endDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Attendance</p>
                    <p>{selectedProject.totalPresent} / {selectedProject.totalDays}</p>
                    <Progress 
                      percent={(selectedProject.totalPresent / selectedProject.totalDays) * 100} 
                      color="blue-500"
                      className="mt-2"
                    />
                  </div>
                </div>
              </Card>
              <Card>
                <h5 className="font-semibold mb-4">Recent Attendance</h5>
                <Table>
                  <THead>
                    <Tr>
                      <Th>Date</Th>
                      <Th>Attendance</Th>
                    </Tr>
                  </THead>
                  <TBody>
                    {selectedProject.analytics?.slice(0, 5).map((item: any, index: number) => (
                      <Tr key={index}>
                        <Td>{item.period}</Td>
                        <Td>{item.attendanceRate}%</Td>
                      </Tr>
                    ))}
                  </TBody>
                </Table>
              </Card>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default ProjectAnalytics;