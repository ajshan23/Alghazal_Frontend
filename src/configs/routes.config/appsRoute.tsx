import { lazy } from 'react'
import { APP_PREFIX_PATH } from '@/constants/route.constant'
import { ADMIN, DRIVER, ENGINEER, SUPERADMIN, USER } from '@/constants/roles.constant'
import type { Routes } from '@/@types/routes'

const appsRoute: Routes = [
    {
        key: 'apps.dashboard',
        path: `${APP_PREFIX_PATH}/dashboard`,
        component: lazy(() => import('@/views/project/ProjectDashboard')),
        authority: [ADMIN, USER,ENGINEER,SUPERADMIN,DRIVER],
    },
      {
        key: 'apps.profile',
        path: `${APP_PREFIX_PATH}/account/settings/profile`,
        component: lazy(() => import('@/views/account/Settings/components/Profile')),
        authority: [ADMIN, USER,ENGINEER,SUPERADMIN,DRIVER],
    },
    {
        key: 'appsEstimation.estimationList',
        path: `${APP_PREFIX_PATH}/estimation-list`,
        component: lazy(() => import('@/views/estimation/estimationlist/EstimationList')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'appsEstimationCreation.estimationCreation',
        path: `${APP_PREFIX_PATH}/create-estimation/:projectId`,
        component: lazy(() => import('@/views/estimation/estimationcreation/EstimationCreations')),
        authority: [ADMIN, USER,SUPERADMIN,ENGINEER],
    },
    {
        key: 'appsEstimation.estimationView',
        path: `${APP_PREFIX_PATH}/estimation/:id`,
        component: lazy(() => import('@/views/estimation/estimationView/EstimationView')),
        authority: [ADMIN, USER,SUPERADMIN,ENGINEER],
    },
    {
        key: 'appsEstimationView.estimationView',
        path: `${APP_PREFIX_PATH}/estimation-view/:id`,
        component: lazy(() => import('@/views/estimation/estimationViews/EstimationView')),
        authority: [ADMIN, USER,SUPERADMIN,ENGINEER],
    },    
      {
        key: 'appsEstimationEdit.estimationEdit',
        path: `${APP_PREFIX_PATH}/estimation/edit/:projectId/:estimationId`,
        component: lazy(() => import('@/views/estimation/estimationcreation/EstimationCreations')),
        authority: [ADMIN, USER,SUPERADMIN,ENGINEER],
    },    
    {
        key: 'appsUsers.userNew',
        path: `${APP_PREFIX_PATH}/user-new`,
        component: lazy(() => import('@/views/users/UserNew/UserNew')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'appsUsers.userForm',
        path: `${APP_PREFIX_PATH}/user-form/:id?`, // Make id optional
        component: lazy(() => import('@/views/users/UserNew/UserNew')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'appsUsers.usersList',
        path: `${APP_PREFIX_PATH}/user-list`,
        component: lazy(() => import('@/views/users/UserList/UserList')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'appsUserView.UserView',
        path: `${APP_PREFIX_PATH}/user-view/:id`,
        component: lazy(() => import('@/views/users/CustomerDetail/CustomerDetail')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'appsClients.clientsList',
        path: `${APP_PREFIX_PATH}/client-list`,
        component: lazy(() => import('@/views/client/ClientList/ClientList')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'appsClients.ClientNew',
        path: `${APP_PREFIX_PATH}/client-new`,
        component: lazy(() => import('@/views/client/ClientNew/ClientNew')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'appsClients.clientForm',
        path: `${APP_PREFIX_PATH}/client-form/:id?`, // Make id optional
        component: lazy(() => import('@/views/client/ClientNew/ClientNew')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'appsClients.clientView',
        path: `${APP_PREFIX_PATH}/client-view/:id?`, // Make id optional
        component: lazy(() => import('@/views/client/CustomerDetail/CustomerDetail')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'appsProjectNew.projectNew',
        path: `${APP_PREFIX_PATH}/project-new`,
        component: lazy(() => import('@/views/projectNew/ProjectNew/ProjectForm')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'appsProjectEdit.projectEdit',
        path: `${APP_PREFIX_PATH}/project-edit/:id`,
        component: lazy(() => import('@/views/projectNew/ProjectNew/ProjectForm')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'appsProjectList.ProjectList',
        path: `${APP_PREFIX_PATH}/project-list`,
        component: lazy(() => import('@/views/projectNew/ProjectList/components/ProjectTable')),
        authority: [ADMIN, USER,SUPERADMIN],
    },

    {
        key: 'appsProjectView.ProjectView',
        path: `${APP_PREFIX_PATH}/project-view/:id`,
        component: lazy(() => import('@/views/ProjectView/ProjectView/Wallets')),
        authority: [ADMIN, USER,SUPERADMIN,ENGINEER],
    },
    {
        key: 'appsQuotation.quotationNew',
        path: `${APP_PREFIX_PATH}/quotation-new/:projectId`,
        component: lazy(() => import('@/views/quotation/quotationcreation/QuotationCreations')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'appsQuotationEdit.quotationEdit',
        path: `${APP_PREFIX_PATH}/quotation-edit/:projectId/:quotationId`,
        component: lazy(() => import('@/views/quotation/quotationcreation/QuotationCreations')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'apps.ongoingworks',
        path: `${APP_PREFIX_PATH}/ongoingworks`,
        component: lazy(() => import('@/views/workstatus/ProjectDashboard/ProjectDashboard')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'appsQuotationView.QuotationView',
        path: `${APP_PREFIX_PATH}/quotation-view/:projectId`,
        component: lazy(() => import('@/views/quotation/quotationview/QuotationView')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'appsPublicView.PublicView',
        path: `${APP_PREFIX_PATH}/public-view`,
        component: lazy(() => import('@/views/publicview/publicviews/PublicView')),
        authority: [ADMIN, USER,SUPERADMIN,ENGINEER],
    },
    {
        key: 'apps.lpo',
        path: `${APP_PREFIX_PATH}/lpo/:projectId`,
        component: lazy(() => import('@/views/lpo/lpocreate/LpoForm/LpoForm')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'apps.lpo',
        path: `${APP_PREFIX_PATH}/lpo-view/:id`,
        component: lazy(() => import('@/views/lpo/lpoView/lpoView')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'apps.workprogress',
        path: `${APP_PREFIX_PATH}/workprogress/:projectId`,
        component: lazy(() => import('@/views/workprogress/progress/progress/Progress')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'apps.teamAssign',
        path: `${APP_PREFIX_PATH}/teams-assign/:projectId`,
        component: lazy(() => import('@/views/workprogress/progress/progress/TeamAssignment')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'apps.workcompletionreport',
        path: `${APP_PREFIX_PATH}/workcompletionreport/:projectId`,
        component: lazy(() => import('@/views/workcompletion/Completionview/CompletionView')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'apps.invoice',
        path: `${APP_PREFIX_PATH}/invoice-view/:projectId`,
        component: lazy(() => import('@/views/invoice/invoiceview/InvoiceView')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'apps.projectAttandance',
        path: `${APP_PREFIX_PATH}/attendance-summary/:projectId`,
        component: lazy(() => import('@/views/attandance/AttendanceManagement/AttendanceSummary')),
        authority: [ADMIN, USER,SUPERADMIN ,ENGINEER],
    },
    {
        key: 'apps.normalAttendanceMark',
        path: `${APP_PREFIX_PATH}/attendance/normal/mark`,
        component: lazy(() => import('@/views/attandance/AttendanceManagement/NormalAttendanceMarkPage')),
        authority: [ADMIN, SUPERADMIN ],
    },
    {
        key: 'apps.monthlyAttendancePerUser',
        path: `${APP_PREFIX_PATH}/attendance/user/:userId?`,
        component: lazy(() => import('@/views/attandance/AttendanceManagement/UserMonthlyAttendancePage')),
        authority: [ADMIN, SUPERADMIN,],
    },
    {
        key: 'apps.attandanceDashboard',
        path: `${APP_PREFIX_PATH}/attendance/dashboard`,
        component: lazy(() => import('@/views/attandance/AttendanceManagement/AttendanceDashboard')),
        authority: [ADMIN, SUPERADMIN ],
    
    },
    
    
    // {
    //     key: 'apps.expenseAdd',
    //     path: `${APP_PREFIX_PATH}/expense/:projectId`,
    //     component: lazy(() => import('@/views/expense-tracker/expense-form/ExpenseForm')),
    //     authority: [ADMIN, USER,SUPERADMIN],
    // },
    // {
    //     key: 'apps.expenseAdd',
    //     path: `${APP_PREFIX_PATH}/expense/edit/:projectId`,
    //     component: lazy(() => import('@/views/expense-tracker/expense-form/ExpenseForm')),
    //     authority: [ADMIN, USER,SUPERADMIN],
    // },
    {
        key: 'apps.expenseAdd',
        path: `${APP_PREFIX_PATH}/expense/:projectId`,
        component: lazy(() => import('@/views/expense-tracker/expense-form/ExpenseForm')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'apps.expenseView',
        path: `${APP_PREFIX_PATH}/expense-view/:expenseId`,
        component: lazy(() => import('@/views/expense-tracker/expense-form/EspenseView')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
     {
        key: 'apps.shopView',
        path: `${APP_PREFIX_PATH}/shop-view`,
        component: lazy(() => import('@/views/all-bills/shops/shopList')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
     {
        key: 'apps.shopView',
        path: `${APP_PREFIX_PATH}/new-shop`,
        component: lazy(() => import('@/views/all-bills/shops/newShops/NewShopDetails')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
    key: 'apps.editShop',
    path: `${APP_PREFIX_PATH}/new-shop/:id`,
    component: lazy(() => import('@/views/all-bills/shops/newShops/NewShopDetails')),
    authority: [ADMIN, USER, SUPERADMIN],
},
   {
    key: 'apps.shopDetails',
    path: `${APP_PREFIX_PATH}/shop-details/:id`,
    component: lazy(() => import('@/views/all-bills/shops/ShopDetails')),
    authority: [ADMIN, USER, SUPERADMIN],
},
//Categories
 {
        key: 'apps.cateView',
        path: `${APP_PREFIX_PATH}/cat-view`,
        component: lazy(() => import('@/views/all-bills/category/CategoryList')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
     {
        key: 'apps.cateView',
        path: `${APP_PREFIX_PATH}/new-cat`,
        component: lazy(() => import('@/views/all-bills/category/NewCategoryDetails')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
    key: 'apps.editCate',
    path: `${APP_PREFIX_PATH}/new-cat/:id`,
    component: lazy(() => import('@/views/all-bills/category/NewCategoryDetails')),
    authority: [ADMIN, USER, SUPERADMIN],
},
//Vehicle
 {
        key: 'apps.vehicleView',
        path: `${APP_PREFIX_PATH}/vehicle-view`,
        component: lazy(() => import('@/views/all-bills/vehicle/VehicleList')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
     {
        key: 'apps.vehicleView',
        path: `${APP_PREFIX_PATH}/new-vehicle`,
        component: lazy(() => import('@/views/all-bills/vehicle/NewVehicleDetails')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
    key: 'apps.vehicleView',
    path: `${APP_PREFIX_PATH}/new-vehicle/:id`,
    component: lazy(() => import('@/views/all-bills/vehicle/NewVehicleDetails')),
    authority: [ADMIN, USER, SUPERADMIN],
},
//Bills
    {
        key: 'apps.billView',
        path: `${APP_PREFIX_PATH}/bill-view`,
        component: lazy(() => import('@/views/all-bills/bills/BillList')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
     {
        key: 'apps.billView',
        path: `${APP_PREFIX_PATH}/new-gen-bill`,
        component: lazy(() => import('@/views/all-bills/newBills/NewGeneralBill')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
        {
    key: 'apps.billView',
    path: `${APP_PREFIX_PATH}/new-gen-bill/:id`,
    component: lazy(() => import('@/views/all-bills/newBills/NewGeneralBill')),
    authority: [ADMIN, USER, SUPERADMIN],
},
       {
        key: 'apps.messBillView',
        path: `${APP_PREFIX_PATH}/mess-bill-view`,
        component: lazy(() => import('@/views/all-bills/bills/MessBillList')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
     {
        key: 'apps.messBillView',
        path: `${APP_PREFIX_PATH}/new-mess-bill`,
        component: lazy(() => import('@/views/all-bills/newBills/NewMessBill')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'apps.messBillView',
        path: `${APP_PREFIX_PATH}/new-mess-bill/:id`,
        component: lazy(() => import('@/views/all-bills/newBills/NewMessBill')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
      {
        key: 'apps.fuelBillView',
        path: `${APP_PREFIX_PATH}/fuel-bill-view`,
        component: lazy(() => import('@/views/all-bills/bills/FuelBillList')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
     {
        key: 'apps.fuelBillView',
        path: `${APP_PREFIX_PATH}/new-fuel-bill`,
        component: lazy(() => import('@/views/all-bills/newBills/NewFuelBill')),
        authority: [ADMIN, USER,SUPERADMIN],
    },{
        key: 'apps.fuelBillView',
        path: `${APP_PREFIX_PATH}/new-fuel-bill/:id`,
        component: lazy(() => import('@/views/all-bills/newBills/NewFuelBill')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'apps.BillViewAttachments',
        path: `${APP_PREFIX_PATH}/bill-attachments`,
        component: lazy(() => import('@/views/all-bills/bills/components/BillAttachments')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
     {
        key: 'apps.vehicleBillView',
        path: `${APP_PREFIX_PATH}/vehicle-bill-view`,
        component: lazy(() => import('@/views/all-bills/bills/VehicleBillList')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
     {
        key: 'apps.vehicleBillView',
        path: `${APP_PREFIX_PATH}/new-vehicle-bill`,
        component: lazy(() => import('@/views/all-bills/newBills/NewVehicleBill')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
     {
        key: 'apps.vehicleBillView',
        path: `${APP_PREFIX_PATH}/new-vehicle-bill/:id`,
        component: lazy(() => import('@/views/all-bills/newBills/NewVehicleBill')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
      {
        key: 'apps.accBillView',
        path: `${APP_PREFIX_PATH}/acc-bill-view`,
        component: lazy(() => import('@/views/all-bills/bills/AccBillList')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
     {
        key: 'apps.vehicleBillView',
        path: `${APP_PREFIX_PATH}/new-acc-bill`,
        component: lazy(() => import('@/views/all-bills/newBills/NewAccBill')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
     {
        key: 'apps.vehicleBillView',
        path: `${APP_PREFIX_PATH}/new-acc-bill/:id`,
        component: lazy(() => import('@/views/all-bills/newBills/NewAccBill')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'apps.commissionBillView',
        path: `${APP_PREFIX_PATH}/commission-bill-view`,
        component: lazy(() => import('@/views/all-bills/bills/CommissionBillList')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'apps.commissionBillView',
        path: `${APP_PREFIX_PATH}/new-commission-bill`,
        component: lazy(() => import('@/views/all-bills/newBills/NewComBill')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'apps.commissionBillView', 
        path: `${APP_PREFIX_PATH}/new-commission-bill/:id`,
        component: lazy(() => import('@/views/all-bills/newBills/NewComBill')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
   {
    key: 'apps.adibReportView',
    path: `${APP_PREFIX_PATH}/adib-report-view`,
    component: lazy(() => import('@/views/all-bills/bills/AdibReportList')),
    authority: [ADMIN, USER,SUPERADMIN],
   },
   {
    key: 'apps.adibReportView', 
    path: `${APP_PREFIX_PATH}/new-adib-report`,
    component: lazy(() => import('@/views/all-bills/newBills/NewAdibReport')),
    authority: [ADMIN, USER,SUPERADMIN],
   },
   {
    key: 'apps.adibReportView', 
    path: `${APP_PREFIX_PATH}/new-adib-report/:id`,
    component: lazy(() => import('@/views/all-bills/newBills/NewAdibReport')),
    authority: [ADMIN, USER,SUPERADMIN],
   },
   {
    key: 'apps.expenseReportView',
    path: `${APP_PREFIX_PATH}/expense-report-view`,
    component: lazy(() => import('@/views/all-bills/bills/ExpenseReportList')),
    authority: [ADMIN, USER,SUPERADMIN],
   },
   {
    key: 'apps.expenseReportView',
    path: `${APP_PREFIX_PATH}/new-expense-report`,
    component: lazy(() => import('@/views/all-bills/newBills/NewExpenseReport')),
    authority: [ADMIN, USER,SUPERADMIN],
   },
   
    {
        key: 'apps.expenseReportView',
        path: `${APP_PREFIX_PATH}/new-expense-report/:id`,
        component: lazy(() => import('@/views/all-bills/newBills/NewExpenseReport')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    
    {
        key: 'apps.profitAndLossReportView',
        path: `${APP_PREFIX_PATH}/profit-and-loss-report-view`,
        component: lazy(() => import('@/views/all-bills/bills/ProfitAndLossReport')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'apps.profitAndLossReportView',
        path: `${APP_PREFIX_PATH}/new-profit-and-loss-report`,
        component: lazy(() => import('@/views/all-bills/newBills/NewProfitAndLossReport')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'apps.profitAndLossReportView',
        path: `${APP_PREFIX_PATH}/new-profit-and-loss-report/:id`,
        component: lazy(() => import('@/views/all-bills/newBills/NewProfitAndLossReport')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    
    {
        key: 'apps.labourExpensesReportView',
        path: `${APP_PREFIX_PATH}/labour-expenses-report-view`,
        component: lazy(() => import('@/views/all-bills/bills/LabourExpensesReport')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    
    {
        key: 'apps.labourExpensesReportView',
        path: `${APP_PREFIX_PATH}/new-labour-expenses-report`,
        component: lazy(() => import('@/views/all-bills/newBills/NewLabourExpensesReport')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'apps.labourExpensesReportView',
        path: `${APP_PREFIX_PATH}/new-labour-expenses-report/:id`,
        component: lazy(() => import('@/views/all-bills/newBills/NewLabourExpensesReport')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'apps.payrollReportView',
        path: `${APP_PREFIX_PATH}/payroll-report-view`,
        component: lazy(() => import('@/views/all-bills/bills/PayrollReport')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'apps.payrollReportView',
        path: `${APP_PREFIX_PATH}/new-payroll-report`,
        component: lazy(() => import('@/views/all-bills/newBills/NewPayrollReport')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'apps.payrollReportView',
        path: `${APP_PREFIX_PATH}/new-payroll-report/:id`,
        component: lazy(() => import('@/views/all-bills/newBills/NewPayrollReport')),
        authority: [ADMIN, USER,SUPERADMIN],
    },    
    {
        key: 'apps.visaExpenseReportView',
        path: `${APP_PREFIX_PATH}/visa-expense-report-view`,
        component: lazy(() => import('@/views/all-bills/bills/VisaExpenseReport')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'apps.visaExpenseReportView',
        path: `${APP_PREFIX_PATH}/new-visa-expense-report`,
        component: lazy(() => import('@/views/all-bills/newBills/NewVisaExpenseReport')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'apps.visaExpenseReportView',
        path: `${APP_PREFIX_PATH}/new-visa-expense-report/:id`,
        component: lazy(() => import('@/views/all-bills/newBills/NewVisaExpenseReport')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
        

        
]

export default appsRoute
