import { lazy } from 'react'
import {  DRV_PREFIX_PATH } from '@/constants/route.constant'
import { ADMIN, ENGINEER, SUPERADMIN, USER ,DRIVER } from '@/constants/roles.constant'
import type { Routes } from '@/@types/routes'

const driverRoute: Routes = [
    {
        key: 'drv.myworks',
        path: `${DRV_PREFIX_PATH}/soon`,
        component: lazy(() => import('@/views/Soon/Welcome/Welcome')),
        authority: [ADMIN, USER,SUPERADMIN ,ENGINEER,DRIVER],
    },
    {
        key: 'drv.projectAttandance',
        path: `${DRV_PREFIX_PATH}/project-attendance/:projectId`,
        component: lazy(() => import('@/views/attandance/AttendanceManagement/AttendanceManagement')),
        authority: [ADMIN, USER,SUPERADMIN ,ENGINEER,DRIVER],
    },
 
]

export default driverRoute
