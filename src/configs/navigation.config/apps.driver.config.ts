import { DRV_PREFIX_PATH } from '@/constants/route.constant'
import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_COLLAPSE,
    NAV_ITEM_TYPE_ITEM,
} from '@/constants/navigation.constant'
import { ADMIN, USER ,SUPERADMIN, ENGINEER,DRIVER} from '@/constants/roles.constant'
import type { NavigationTree } from '@/@types/navigation'

const drvNavigationConfig: NavigationTree[] = [
    {
        key: 'drv',
        path: '',
        title: 'drv',
        translateKey: 'DRIVER',
        icon: 'drv',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [ USER,DRIVER],
        subMenu: [
             {
                            key: 'drv.dashboard',
                            path: `${DRV_PREFIX_PATH}/dashboard`,
                            title: 'Dashboard',
                            translateKey: 'Dashboard',
                            icon: 'project',
                            type: NAV_ITEM_TYPE_ITEM,
                            authority: [USER,DRIVER],
                            subMenu: [],
               },
            {
                key: 'drv.myworks',
                path: `${DRV_PREFIX_PATH}/soon`,
                title: 'My works',
                translateKey: 'My works',
                icon: 'graph',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ USER,DRIVER],
                subMenu: [],
   },
       
           
        ],
    },
]

export default drvNavigationConfig
