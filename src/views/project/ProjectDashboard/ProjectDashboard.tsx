import { useEffect } from 'react'
import reducer, {
    getProjectDashboardData,
    useAppDispatch,
    useAppSelector,
} from './store'
import { injectReducer } from '@/store'
import Loading from '@/components/shared/Loading'
import ProjectDashboardHeader from './components/ProjectDashboardHeader'
import TaskOverview from './components/TaskOverview'
import MyTasks from './components/MyTasks'
import Projects from './components/Projects'
import Schedule from './components/Schedule'
import Activities from './components/Activities'

injectReducer('projectDashboard', reducer)

let user = JSON.parse(localStorage.getItem('user') || '{}')

console.log(user, 'user')



// projectDashboardData.ts
 const projectDashboardData = {
    dashboardData: {
        userName: user?.name || 'user',
        taskCount: 12,
        projectOverviewData: {
            chart: {
                weekly: {
                    onGoing: 34,
                    finished: 18,
                    total: 52,
                    series: [
                        { name: 'Ongoing', data: [12, 8, 15, 10, 7, 9, 14] },
                        { name: 'Finished', data: [4, 2, 5, 3, 6, 7, 5] }
                    ],
                    range: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                },
                monthly: {
                    onGoing: 125,
                    finished: 75,
                    total: 200,
                    series: [
                        { name: 'Ongoing', data: [30, 25, 35, 40, 30, 20, 25] },
                        { name: 'Finished', data: [15, 10, 20, 25, 15, 10, 15] }
                    ],
                    range: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7']
                },
                daily: {
                    onGoing: 8,
                    finished: 4,
                    total: 12,
                    series: [
                        { name: 'Ongoing', data: [3, 5, 2, 4, 6, 3, 5] },
                        { name: 'Finished', data: [1, 2, 1, 3, 2, 1, 2] }
                    ],
                    range: ['9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM']
                }
            }
        },
        myTasksData: [
            {
                taskId: 'TASK-001',
                taskSubject: 'Implement user authentication',
                priority: 0,
                assignees: [
                    {
                        id: '1',
                        name: 'John Doe',
                        email: 'john@example.com',
                        img: '/img/avatars/thumb-1.jpg'
                    }
                ]
            },
            {
                taskId: 'TASK-002',
                taskSubject: 'Design dashboard layout',
                priority: 1,
                assignees: [
                    {
                        id: '2',
                        name: 'Jane Smith',
                        email: 'jane@example.com',
                        img: '/img/avatars/thumb-2.jpg'
                    }
                ]
            },
            {
                taskId: 'TASK-003',
                taskSubject: 'Fix mobile responsiveness',
                priority: 2,
                assignees: [
                    {
                        id: '1',
                        name: 'John Doe',
                        email: 'john@example.com',
                        img: '/img/avatars/thumb-1.jpg'
                    },
                    {
                        id: '3',
                        name: 'Robert Johnson',
                        email: 'robert@example.com',
                        img: '/img/avatars/thumb-3.jpg'
                    }
                ]
            }
        ],
        projectsData: [
            {
                id: '1',
                name: 'Website Redesign',
                category: 'Web Development',
                desc: 'Complete redesign of company website',
                attachmentCount: 12,
                totalTask: 45,
                completedTask: 28,
                progression: 62,
                dayleft: 14,
                status: 'in progress',
                member: [
                    { id: '1', name: 'John Doe', email: 'john@example.com', img: '/img/avatars/thumb-1.jpg' },
                    { id: '2', name: 'Jane Smith', email: 'jane@example.com', img: '/img/avatars/thumb-2.jpg' }
                ]
            },
            {
                id: '2',
                name: 'Mobile App',
                category: 'Mobile Development',
                desc: 'Development of company mobile application',
                attachmentCount: 8,
                totalTask: 32,
                completedTask: 12,
                progression: 38,
                dayleft: 21,
                status: 'in progress',
                member: [
                    { id: '3', name: 'Robert Johnson', email: 'robert@example.com', img: '/img/avatars/thumb-3.jpg' },
                    { id: '4', name: 'Emily Davis', email: 'emily@example.com', img: '/img/avatars/thumb-4.jpg' }
                ]
            }
        ],
        scheduleData: [
            {
                id: '1',
                time: '10:30 AM',
                eventName: 'Team Meeting',
                desciption: 'Weekly project sync',
                type: 'meeting'
            },
            {
                id: '2',
                time: '2:00 PM',
                eventName: 'Client Workshop',
                desciption: 'Requirements gathering',
                type: 'workshop'
            },
            {
                id: '3',
                time: '4:30 PM',
                eventName: 'Code Review',
                desciption: 'Authentication module',
                type: 'task'
            }
        ],
        activitiesData: [
            {
                type: 'new-project',
                dateTime: 1672574400000,
                ticket: 'PROJ-001',
                status: 0,
                userName: 'John Doe',
                userImg: '/img/avatars/thumb-1.jpg',
                comment: 'Created new project "Website Redesign"'
            },
            {
                type: 'comment',
                dateTime: 1672660800000,
                userName: 'Jane Smith',
                userImg: '/img/avatars/thumb-2.jpg',
                comment: 'Submitted design mockups for review',
                files: ['mockup-v1.pdf']
            },
            {
                type: 'ticket-update',
                dateTime: 1672747200000,
                ticket: 'TASK-001',
                status: 1,
                userName: 'Robert Johnson',
                userImg: '/img/avatars/thumb-3.jpg',
                comment: 'Marked task as completed'
            }
        ]
    },
    loading: false
};
const ProjectDashboard = () => {
    const dispatch = useAppDispatch()

    const dashboardData = projectDashboardData.dashboardData;
    const loading = false;
    useEffect(() => {
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchData = () => {
        // dispatch(getProjectDashboardData())
    }

    return (
        <div className="flex flex-col gap-4 h-full">
            <Loading loading={loading}>
                <ProjectDashboardHeader
                    userName={dashboardData?.userName}
                    taskCount={dashboardData?.taskCount}
                />
                <div className="flex flex-col xl:flex-row gap-4">
                    <div className="flex flex-col gap-4 flex-auto">
                    <Projects data={dashboardData?.projectsData} />

                        <TaskOverview
                            data={dashboardData?.projectOverviewData}
                        />
                        {/* <MyTasks data={dashboardData?.myTasksData} /> */}
                    </div>
                 
                </div>
            </Loading>
        </div>
    )
}

export default ProjectDashboard
