import { lazy } from 'react'
import {  ENG_PREFIX_PATH } from '@/constants/route.constant'
import { ADMIN, ENGINEER, SUPERADMIN, USER } from '@/constants/roles.constant'
import type { Routes } from '@/@types/routes'

const engineerRoute: Routes = [
    {
        key: 'eng.myworks',
        path: `${ENG_PREFIX_PATH}/myworks`,
        component: lazy(() => import('@/views/projectList/ProjectList/ProjectList')),
        authority: [ADMIN, USER,SUPERADMIN ,ENGINEER],
    },
    
 
]

export default engineerRoute
