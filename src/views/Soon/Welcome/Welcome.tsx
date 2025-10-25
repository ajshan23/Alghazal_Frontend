import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loading } from '@/components/shared'
import { Button, Card, Tag } from '@/components/ui'
import { HiOutlineArrowRight } from 'react-icons/hi'
import ProgressBar from '@/views/workprogress/progress/progress/ProgressBar'
import { apiGetDriverProjects } from './api/api'

interface Project {
  id: string;
  projectName: string;
  projectNumber: string;
  location: string;
  status: string;
  progress: number;
  assignedWorkers: {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  }[];
  client: {
    clientName: string;
    mobileNumber: string;
  };
}

const ProjectDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await apiGetDriverProjects()
        console.log(response);
        
        if (response.data) {
          const formattedProjects = response.data.data.projects.map((project: any) => ({
            id: project._id,
            projectName: project.projectName,
            projectNumber: project.projectNumber,
            location: `${project.building}, ${project.apartmentNumber}`,
            status: project.status,
            progress: project.progress,
            assignedWorkers: project.assignedWorkers || [],
            client: project.client || { clientName: 'N/A', mobileNumber: 'N/A' }
          }))
          setProjects(formattedProjects)
        }
      } catch (error) {
        console.error('Failed to fetch driver projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Check if project is viewable (status is "work_started" or "in_progress")
  const isProjectViewable = (status: string) => {
    return status === "work_started" || status === "in_progress"
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <Loading loading={loading}>
        <div className="flex flex-col xl:flex-row gap-4">
          <div className="flex flex-col gap-4 flex-auto">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-bold dark:text-gray-200">
                  My Assigned Projects
                </h4>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {projects.length} projects
                </span>
              </div>
              
              {projects.length > 0 ? (
                <div className="space-y-4">
                  {projects.map((project) => {
                    const canView = isProjectViewable(project.status)
                    
                    return (
                      <Card key={project.id} bordered className="hover:shadow-lg transition-shadow">
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h5 className="font-semibold dark:text-gray-200">
                                {project.projectName} ({project.projectNumber})
                              </h5>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {project.location}
                              </p>
                            </div>
                            <Tag className="text-xs capitalize">
                              {project.status.replace('_', ' ')}
                            </Tag>
                          </div>
                          
                          <div className="mb-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-500 dark:text-gray-400">Progress</span>
                              <span className="font-semibold">{project.progress}%</span>
                            </div>
                            <ProgressBar 
                              percent={project.progress} 
                              showInfo={false}
                              className="h-2"
                            />
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Client: {project.client.clientName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Team: {project.assignedWorkers.length} workers
                              </p>
                            </div>
                            <Button
                              size="xs"
                              variant="plain"
                              icon={<HiOutlineArrowRight />}
                              onClick={() => navigate(`/drv/project-attendance/${project.id}`)}
                              disabled={!canView}
                              title={canView ? "View project details" : "Project not yet started"}
                            >
                              View
                            </Button>
                          </div>
                          
                          {!canView && (
                            <div className="mt-2 text-xs text-amber-500 dark:text-amber-400">
                              Project will be available when work starts
                            </div>
                          )}
                        </div>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <Card className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    No projects assigned to you yet
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Check back later for new assignments
                  </p>
                </Card>
              )}
            </Card>
          </div>
        </div>
      </Loading>
    </div>
  )
}

export default ProjectDashboard