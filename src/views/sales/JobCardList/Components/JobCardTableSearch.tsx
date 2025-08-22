// import { useRef } from 'react';
// import Input from '@/components/ui/Input';
// import { HiOutlineSearch } from 'react-icons/hi';
// import debounce from 'lodash/debounce';
// import cloneDeep from 'lodash/cloneDeep';
// import type { TableQueries } from '@/@types/common';
// import type { ChangeEvent } from 'react';
// import { useAppDispatch, useAppSelector } from '@/store'; // Adjust the import path as needed
// import { getJobCards, setTableData } from '../store'; // Adjust the import path as needed

// const JobCardTableSearch = () => {
//     const dispatch = useAppDispatch();

//     const searchInput = useRef(null);

//     const tableData = useAppSelector(
//         (state) => state.jobCardList.data.tableData, // Adjust the Redux state path as needed
//     );

//     const debounceFn = debounce(handleDebounceFn, 500);

//     function handleDebounceFn(val: string) {
//         const newTableData = cloneDeep(tableData);
//         newTableData.query = val;
//         newTableData.pageIndex = 1;

//         if (typeof val === 'string' && val.length > 1) {
//             fetchData(newTableData);
//         }

//         if (typeof val === 'string' && val.length === 0) {
//             fetchData(newTableData);
//         }
//     }

//     const fetchData = (data: TableQueries) => {
//         dispatch(setTableData(data));
//         dispatch(getJobCards(data)); // Adjust the action as needed
//     };

//     const onSearch = (e: ChangeEvent<HTMLInputElement>) => {
//         debounceFn(e.target.value);
//     };

//     return (
//         <Input
//             ref={searchInput}
//             className="max-w-md md:w-52 md:mb-0 mb-4"
//             size="sm"
//             placeholder="Search job cards..."
//             prefix={<HiOutlineSearch className="text-lg" />}
//             onChange={onSearch}
//         />
//     );
// };

// export default JobCardTableSearch;