import { apiSignIn, apiSignOut, apiSignUp } from '@/services/AuthService'
import {
    setUser,
    signInSuccess,
    signOutSuccess,
    useAppSelector,
    useAppDispatch,
} from '@/store'
import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useNavigate } from 'react-router-dom'
import useQuery from './useQuery'
import type { SignInCredential, SignUpCredential } from '@/@types/auth'
import axios from 'axios'

type Status = 'success' | 'failed'

function useAuth() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const query = useQuery()

    const { token, signedIn } = useAppSelector((state) => state.auth.session)

    const signIn = async (
        values: SignInCredential,
    ): Promise<{ status: Status; message: string }> => {
        try {
            // Make API request
            const response = await axios.post(`${appConfig.apiPrefix}/user/login`, {
                email: values.userName.includes('@') ? values.userName : `${values.userName}@yourdomain.com`,
                password: values.password
            });
            console.log(response,"123");
            

            if (response.status===200) {
                const { user, token } = response?.data?.data;
                
                // Store tokens and user data in localStorage
                localStorage.setItem('authToken', token);
                localStorage.setItem('user', JSON.stringify(user));
                
                // Update Redux state
                dispatch(signInSuccess(token));
                dispatch(setUser({
                    avatar: user?.avatar || '/img/avatars/thumb-1.png',
                    userName: user?.name || user?.email, // Use name if available
                    authority: user?.role ? [user.role] : ['user'], // Default role
                    email: user?.email,
                }));

                // Redirect to dashboard or intended URL
                const redirectUrl = query.get(REDIRECT_URL_KEY);
                navigate(redirectUrl || appConfig.authenticatedEntryPath);

                return { status: 'success', message: 'Login successful' };
            }
            
            return { status: 'failed', message: response.data.message || 'Login failed' };
        } catch (error: any) {
            console.error('Login error:', error);
            return {
                status: 'failed',
                message: error.response?.data?.message || 'Login failed. Please try again.',
            };
        }
    }

    const signUp = async (values: SignUpCredential) => {
        try {
            const response = await axios.post('http://localhost:4000/api/user/register', values);
            if (response.data.success) {
                return {
                    status: 'success',
                    message: 'Registration successful. Please login.',
                };
            }
            return {
                status: 'failed',
                message: response.data.message || 'Registration failed',
            };
        } catch (error: any) {
            return {
                status: 'failed',
                message: error.response?.data?.message || 'Registration failed. Please try again.',
            }
        }
    }

    const handleSignOut = () => {
        // Clear localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        
        // Update Redux state
        dispatch(signOutSuccess());
        dispatch(setUser({
            avatar: '',
            userName: '',
            email: '',
            authority: [],
        }));
        
        // Redirect to login page
        navigate(appConfig.unAuthenticatedEntryPath);
    }

    const signOut = async () => {
        try {
            await apiSignOut();
        } finally {
            handleSignOut();
        }
    }

    return {
        authenticated: token && signedIn,
        signIn,
        signUp,
        signOut,
    }
}

export default useAuth