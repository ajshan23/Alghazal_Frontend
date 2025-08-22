import { APP_PREFIX_PATH } from '@/constants/route.constant'
import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_COLLAPSE,
    NAV_ITEM_TYPE_ITEM,
} from '@/constants/navigation.constant'
import { ADMIN, USER ,SUPERADMIN,ENGINEER} from '@/constants/roles.constant'
import type { NavigationTree } from '@/@types/navigation'

const appsNavigationConfig: NavigationTree[] = [
    {
        key: 'apps',
        path: '',
        title: 'APPS',
        translateKey: 'nav.apps',
        icon: 'apps',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [ADMIN, USER,SUPERADMIN],
        subMenu: [
             {
                        key: 'apps.dashboard',
                        path: `${APP_PREFIX_PATH}/dashboard`,
                        title: 'Dashboard',
                        translateKey: 'Dashboard',
                        icon: 'project',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER,SUPERADMIN],
                        subMenu: [],
           },

//            {
//             key: 'apps.ongoingworks',
//             path: `${APP_PREFIX_PATH}/ongoingworks`,
//             title: 'Ongoing Works',
//             translateKey: 'Ongoing Works',
//             icon: 'graph',
//             type: NAV_ITEM_TYPE_ITEM,
//             authority: [ADMIN, USER,SUPERADMIN],
//             subMenu: [],
// },
         
            // {
            //     key: 'apps.estimation',
            //     path: '',
            //     title: 'Estimation',
            //     translateKey: 'nav.appsEstimation.estimation',
            //     icon: 'crm',
            //     type: NAV_ITEM_TYPE_COLLAPSE,
            //     authority: [ADMIN, USER],
            //     subMenu: [
                    
            //         {
            //             key: 'appsEstimation.estimationList',
            //             path: `${APP_PREFIX_PATH}/estimation-list`,
            //             title: 'List Estimation ',
            //             translateKey: 'nav.appsEstimation.estimationList',
            //             icon: '',
            //             type: NAV_ITEM_TYPE_ITEM,
            //             authority: [ADMIN, USER],
            //             subMenu: [],
            //         },
            //         {
            //             key: 'appsEstimationCreation.estimationCreation',
            //             path: `${APP_PREFIX_PATH}/create-estimation`,
            //             title: 'Create Estimation ',
            //             translateKey: 'nav.appsEstimationCreation.estimationCreation',
            //             icon: '',
            //             type: NAV_ITEM_TYPE_ITEM,
            //             authority: [ADMIN, USER],
            //             subMenu: [],
            //         },
            //         // {
            //         //     key: 'appsEstimationView.estimationView',
            //         //     path: `${APP_PREFIX_PATH}/estimation-view`,
            //         //     title: 'Estimation View',
            //         //     translateKey: 'nav.appsEstimationView.estimationView',
            //         //     icon: '',
            //         //     type: NAV_ITEM_TYPE_ITEM,
            //         //     authority: [ADMIN, USER],
            //         //     subMenu: [],
            //         // },
                    
            //     ],
            // },
            
          

            {
                key: 'apps.clients',
                path: '',
                title: 'Clients',
                translateKey: 'nav.appsClients.clients',
                icon: 'client',
                type: NAV_ITEM_TYPE_COLLAPSE,
                authority: [ADMIN, USER,SUPERADMIN],
                subMenu: [
                    
                    {
                        key: 'appsClients.clientsList',
                        path: `${APP_PREFIX_PATH}/client-list`,
                        title: ' Client List',
                        translateKey: 'nav.appsClients.clientsList',
                        icon: '',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN,SUPERADMIN],
                        subMenu: [],
                    },
                    // {
                    //     key: 'appsClients.ClientNew',
                    //     path: `${APP_PREFIX_PATH}/client-new`,
                    //     title: 'Client New',
                    //     translateKey: 'nav.appsClients.ClientNew',
                    //     icon: '',
                    //     type: NAV_ITEM_TYPE_ITEM,
                    //     authority: [ADMIN, USER,SUPERADMIN],
                    //     subMenu: [],
                    // },
                  
                    
                ],
            },
//             {
//                 key: 'apps.myworks',
//                 path: `${APP_PREFIX_PATH}/myworks`,
//                 title: 'My works',
//                 translateKey: 'nav.apps.myworks',
//                 icon: 'project',
//                 type: NAV_ITEM_TYPE_ITEM,
//                 authority: [ADMIN, USER,SUPERADMIN],
//                 subMenu: [],
//    },
            {
                key: 'apps.project',
                path: '',
                title: 'Project',
                translateKey: 'nav.appsProjectNew.project',
                icon: 'project',
                type: NAV_ITEM_TYPE_COLLAPSE,
                authority: [ADMIN, USER,SUPERADMIN,ENGINEER],
                subMenu: [
                    
                    {
                        key: 'appsProjectNew.projectNew',
                        path: `${APP_PREFIX_PATH}/project-new`,
                        title: ' Project New',
                        translateKey: 'nav.appsProjectNew.projectNew',
                        icon: '',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER,SUPERADMIN],
                        subMenu: [],
                    },
                    {
                        key: 'appsProjectList.ProjectList',
                        path: `${APP_PREFIX_PATH}/project-list`,
                        title: 'Project List',
                        translateKey: 'nav.appsProjectList.ProjectList',
                        icon: '',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER,SUPERADMIN],
                        subMenu: [],
                    },
                  
                    
                ],
            },
            // {
            //     key: 'apps.quotation',
            //     path: '',
            //     title: 'quotation',
            //     translateKey: 'nav.appsQuotation.quotation',
            //     icon: 'crm',
            //     type: NAV_ITEM_TYPE_COLLAPSE,
            //     authority: [ADMIN, USER,SUPERADMIN],
            //     subMenu: [
                    
            //         {
            //             key: 'appsQuotation.quotationNew',
            //             path: `${APP_PREFIX_PATH}/quotation-new`,
            //             title: 'New Quotation',
            //             translateKey: 'nav.appsQuotation.quotationNew',
            //             icon: '',
            //             type: NAV_ITEM_TYPE_ITEM,
            //             authority: [ADMIN, USER,SUPERADMIN],
            //             subMenu: [],
            //         },
            //         {
            //             key: 'appsQuotationView.QuotationView',
            //             path: `${APP_PREFIX_PATH}/quotation-view`,
            //             title: 'Quotation View',
            //             translateKey: 'nav.appsQuotationView.QuotationView',
            //             icon: '',
            //             type: NAV_ITEM_TYPE_ITEM,
            //             authority: [ADMIN, USER,SUPERADMIN],
            //             subMenu: [],
            //         },
                  
                    
            //     ],
            // },

//             {
//                 key: 'apps.lpo',
//                 path: `${APP_PREFIX_PATH}/lpo`,
//                 title: 'LPO',
//                 translateKey: 'LPO',
//                 icon: 'project',
//                 type: NAV_ITEM_TYPE_ITEM,
//                 authority: [ADMIN, USER,SUPERADMIN],
//                 subMenu: [],
//    },
//    {
//     key: 'apps.workprogress',
//     path: `${APP_PREFIX_PATH}/workprogress`,
//     title: 'Work Progress',
//     translateKey: 'workprogress',
//     icon: 'graph',
//     type: NAV_ITEM_TYPE_ITEM,
//     authority: [ADMIN, USER,SUPERADMIN],
//     subMenu: [],
// },
         
        ],
    },
]

export default appsNavigationConfig
