import { combineReducers } from '@reduxjs/toolkit'
import session, { SessionState } from './sessionSlice'
import user, { UserState } from './userSlice'
import userDetails, { UserDetailsState } from './detailSlice'

const reducer = combineReducers({
    session,
    user,
    userDetails,
})

export type AuthState = {
    session: SessionState
    user: UserState
    userDetails: UserDetailsState
}

export * from './sessionSlice'
export * from './userSlice'
export * from './detailSlice'

export default reducer
