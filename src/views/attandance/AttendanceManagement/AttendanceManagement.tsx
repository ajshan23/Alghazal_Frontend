import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Card, Avatar, Badge, Notification, toast } from '@/components/ui'
import { HiCheck, HiX, HiOutlineRefresh } from 'react-icons/hi'
import { apiGetTodayProjectAttendance, apiMarkAttendance } from '../api/api'
import useThemeClass from '@/utils/hooks/useThemeClass'
import dayjs from 'dayjs'
import { Loading } from '@/components/shared'
import { FiUser } from 'react-icons/fi'
import MarkAttendanceModal from './components/MarkAttendanceModal'

interface Worker {
  _id: string
  firstName: string
  lastName: string
  profileImage?: string
  mobileNumber?: string
  present: boolean
  markedBy?: {
    _id: string
    firstName: string
    lastName: string
  }
  markedAt?: Date
}

interface ProjectData {
  _id: string
  projectName: string
  assignedDriver: {
    _id: string
    firstName: string
    lastName: string
  }
}

const AttendanceManagement = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { textTheme } = useThemeClass()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [project, setProject] = useState<ProjectData | null>(null)
  const [workers, setWorkers] = useState<Worker[]>([])
  const [date, setDate] = useState(dayjs().format('DD MMM YYYY'))
  const [attendanceModal, setAttendanceModal] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null)

  const fetchAttendanceData = async () => {
    try {
      setLoading(true)
      const response = await apiGetTodayProjectAttendance(projectId)
      setProject(response.data.data.project)
      setWorkers(response.data.data.workers)
      setDate(dayjs(response.data.data.date).format('DD MMM YYYY'))
    } catch (error) {
      toast.push(
        <Notification title="Error fetching attendance" type="danger">
          {error.message}
        </Notification>
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendanceData()
  }, [projectId])

  const handleMarkAttendance = async (workerId: string, present: boolean, hour?: number) => {
    try {
      setSubmitting(true)
      await apiMarkAttendance({
        projectId,
        userId: workerId,
        present,
        hour // Pass the selected hour if provided
      })
      
      // Update local state
      setWorkers(prev => prev.map(worker => 
        worker._id === workerId 
          ? { 
              ...worker, 
              present,
              markedBy: {
                _id: 'current-user', // You might want to replace with actual user data
                firstName: 'You',
                lastName: ''
              },
              markedAt: new Date()
            } 
          : worker
      ))
      
      toast.push(
        <Notification title="Success" type="success">
          Attendance marked successfully
        </Notification>
      )
    } catch (error) {
      toast.push(
        <Notification title="Error marking attendance" type="danger">
          {error.message}
        </Notification>
      )
    } finally {
      setSubmitting(false)
      setAttendanceModal(false)
    }
  }

  // const handleMarkAll = async (present: boolean) => {
  //   try {
  //     setSubmitting(true)
  //     await Promise.all(
  //       workers.map(worker => 
  //         apiMarkAttendance({
  //           projectId,
  //           userId: worker._id,
  //           present
  //         })
  //       )
  //     )
      
  //     // Update all workers
  //     setWorkers(prev => prev.map(worker => ({
  //       ...worker,
  //       present,
  //       markedBy: {
  //         _id: 'current-user',
  //         firstName: 'You',
  //         lastName: ''
  //       },
  //       markedAt: new Date()
  //     })))
      
  //     toast.push(
  //       <Notification title="Success" type="success">
  //         All workers marked as {present ? 'present' : 'absent'}
  //       </Notification>
  //     )
  //   } catch (error) {
  //     toast.push(
  //       <Notification title="Error marking attendance" type="danger">
  //         {error.message}
  //       </Notification>
  //     )
  //   } finally {
  //     setSubmitting(false)
  //   }
  // }

  const openModal = (workerId: string) => {
    setSelectedWorker(workerId)
    setAttendanceModal(true)
  }

  const closeModal = () => {
    setSelectedWorker(null)
    setAttendanceModal(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loading />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 h-full">
      <Card
        header={
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h4 className="text-lg font-bold mb-1">Attendance Management</h4>
              <p className="text-gray-500 dark:text-gray-400">
                {project?.projectName} - {date}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              <Button
                size="sm"
                variant="plain"
                icon={<HiOutlineRefresh />}
                onClick={fetchAttendanceData}
              >
                Refresh
              </Button>
              {/* <Button
                size="sm"
                variant="solid"
                onClick={() => handleMarkAll(true)}
                disabled={submitting}
              >
                Mark All Present
              </Button> */}
            </div>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Worker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
              {workers.length > 0 ? (
                workers.map((worker) => (
                  <tr key={worker._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar
                          size="sm"
                          src={worker.profileImage}
                          className="mr-3"
                          icon={<FiUser />}
                        />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-200">
                            {worker.firstName} {worker.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {worker.mobileNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        content={worker.present ? 'Present' : 'Absent'}
                        innerClass={`${
                          worker.present
                            ? 'bg-emerald-500 text-white'
                            : 'bg-red-500 text-white'
                        }`}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="xs"
                          variant="solid"
                          color="green"
                          icon={<HiCheck />}
                          onClick={() => openModal(worker._id)}
                          disabled={submitting || worker.present}
                        >
                          Present
                        </Button>
                        <Button
                          size="xs"
                          variant="solid"
                          color="red"
                          icon={<HiX />}
                          onClick={() => handleMarkAttendance(worker._id, false)}
                          disabled={submitting || !worker.present}
                        >
                          Absent
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No workers assigned to this project
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <MarkAttendanceModal
        isOpen={attendanceModal}
        onClose={closeModal}
        onConfirm={(e, selectedHour) => {
          if (selectedWorker) {
            handleMarkAttendance(selectedWorker, true, selectedHour)
            closeModal(e); 
          }
        }}
      />
    </div>
  )
}

export default AttendanceManagement