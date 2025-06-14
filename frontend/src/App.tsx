import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LoginPage from "./pages/LoginPage.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import { useEffect } from "react";
import DashBoard from "./pages/DashBoard.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import UsersPage from "./pages/UsersPage.tsx";
import InvitationPage from "./pages/InvitationPage.tsx";
import { User } from './utils/types';
import { useUserStore } from './store/userStore';
import { Spin } from 'antd';

const PrivateRoutes = ({ isAuthenticated, isLoading }: { isAuthenticated: boolean, isLoading: boolean }) => {
    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <Spin size="large" />
            </div>
        );
    }
    return (
        isAuthenticated ? <Outlet /> : <Navigate to='/login' />
    )
}

const RoleBasedRoute = ({ user, allowedRoles, isLoading }: { user: User | null, allowedRoles: string[], isLoading: boolean }) => {
    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return allowedRoles.includes(user.role) ? (
        <Outlet />
    ) : (
        <Navigate to="/unauthorized" replace />
    );
};

export default function App() {
    const { isAuthenticated, user, checkAuthStatus, isLoading } = useUserStore();

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);



    return (
        <Router>
            <Routes>
                <Route element={<PrivateRoutes isAuthenticated={isAuthenticated} isLoading={isLoading} />}>
                    <Route path='/' element={<DashBoard />} />
                    <Route path='/profile' element={<ProfilePage />} />
                    <Route element={<RoleBasedRoute user={user} allowedRoles={['admin']} isLoading={isLoading} />}>
                        <Route path='/user' element={<UsersPage />} />
                        <Route path='/invitations' element={<InvitationPage />} />
                    </Route>
                </Route>
                <Route path='/login' element={<LoginPage />} />
                <Route path='/register' element={<RegisterPage />} />
            </Routes>
        </Router>
    )


}