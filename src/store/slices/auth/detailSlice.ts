import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import BaseService from '@/services/BaseService'
    interface UserDetails {
        _id: string
        firstName: string
        lastName: string
        email: string
        profileImage: string
        phoneNumbers: string[]
        role: string
        signatureImage?: string
        isActive: boolean

      }


interface UserDetailsState {
  data: UserDetails | null
  loading: boolean
  error: string | null
}

export const fetchUserDetails = createAsyncThunk<
  UserDetails,
  void,
  { rejectValue: string }
>('userDetails/fetchUserDetails', async (_, { rejectWithValue }) => {
  try {
    const response = await BaseService.get('/user/me', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    return response.data.userDetails || response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch user details')
  }
})

const initialState: UserDetailsState = {
  data: null,
  loading: false,
  error: null,
}

const userDetailsSlice = createSlice({
  name: 'userDetails',
  initialState,
  reducers: {
    clearUserDetails: (state) => {
      state.data = null
      state.error = null
    },
    resetUserDetailsState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserDetails.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to load user details'
      })
  },
})

export const { clearUserDetails, resetUserDetailsState } = userDetailsSlice.actions
export default userDetailsSlice.reducer