import { ENG_PREFIX_PATH } from '@/constants/route.constant'
import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_COLLAPSE,
    NAV_ITEM_TYPE_ITEM,
} from '@/constants/navigation.constant'
import { ADMIN, USER ,SUPERADMIN, ENGINEER} from '@/constants/roles.constant'
import type { NavigationTree } from '@/@types/navigation'

const engNavigationConfig: NavigationTree[] = [
    {
        key: 'eng',
        path: '',
        title: 'eng',
        translateKey: 'ENGINEER',
        icon: 'eng',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [ENGINEER],
        subMenu: [
           
            {
                key: 'eng.myworks',
                path: `${ENG_PREFIX_PATH}/myworks`,
                title: 'My works',
                translateKey: 'My works',
                icon: 'graph',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ENGINEER],
                subMenu: [],
   },
       
           
        ],
    },
]

export default engNavigationConfig
