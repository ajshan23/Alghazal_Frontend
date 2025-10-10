import authRoute from './authRoute'
import appsRoute from './appsRoute'
import engineerRoute from './engineerRoute'

import type { Routes } from '@/@types/routes'
import driverRoute from './driverRoute'

export const publicRoutes: Routes = [...authRoute]

export const protectedRoutes: Routes = [
    ...appsRoute,
    ...engineerRoute,
    ...driverRoute,
    
]
