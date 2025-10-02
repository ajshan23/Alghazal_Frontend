import { APP_PREFIX_PATH } from '@/constants/route.constant'
import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_COLLAPSE,
    NAV_ITEM_TYPE_ITEM,
} from '@/constants/navigation.constant'
import { ADMIN, USER ,SUPERADMIN} from '@/constants/roles.constant'
import type { NavigationTree } from '@/@types/navigation'

const appsNavigationConfig: NavigationTree[] = [
    {
        key: 'hr',
        path: '',
        title: 'HR',
        translateKey: 'HR',
        icon: 'hr',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [ADMIN, USER,SUPERADMIN],
        subMenu: [
          
            
            {
                key: 'apps.users',
                path: '',
                title: 'Staff',
                translateKey: 'nav.appsUsers.users',
                icon: 'staff',
                type: NAV_ITEM_TYPE_COLLAPSE,
                authority: [ADMIN, USER,SUPERADMIN],
                subMenu: [
                    
                    {
                        key: 'appsUsers.usersList',
                        path: `${APP_PREFIX_PATH}/user-list`,
                        title: ' Staff List',
                        translateKey: 'nav.appsUsers.usersList',
                        icon: '',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER,SUPERADMIN],
                        subMenu: [],
                    },
                    
                  
                    
                ],
            },

            {
                key: 'apps.attandance',
                path: '',
                title: 'Attandance',
                translateKey: 'nav.attandance.Attandance',
                icon: 'attendance',
                type: NAV_ITEM_TYPE_COLLAPSE,
                authority: [ADMIN, SUPERADMIN],
                subMenu: [
        //             {
        //                 key: 'attandance.dashboard',
        //                 path: `${APP_PREFIX_PATH}/attendance/dashboard`,
        //                 title: 'Dashboard',
        //                 translateKey: 'Dashboard',
        //                 icon: 'project',
        //                 type: NAV_ITEM_TYPE_ITEM,
        //                 authority: [ADMIN, USER,SUPERADMIN],
        //                 subMenu: [],
        //    },

                    {
                        key: 'attandance.dailyAttandance',
                        path: `${APP_PREFIX_PATH}/attendance/normal/mark`,
                        title: ' Daily Attandance',
                        translateKey: 'nav.appsUsers.Daily',
                        icon: '',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER,SUPERADMIN],
                        subMenu: [],
                    },
                    {
                        key: 'attandance.monthlyAttandance',
                        path: `${APP_PREFIX_PATH}/attendance/user`,
                        title: ' Monthly Attandance',
                        translateKey: 'nav.appsUsers.Monthly',
                        icon: '',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER,SUPERADMIN],
                        subMenu: [],
                    },
                    
                  
                    
                ],
            },
         
        ],
    },
]

export default appsNavigationConfig
