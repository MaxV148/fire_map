import {BrowserRouter as Router, Routes, Route, Navigate, Outlet} from 'react-router-dom';
import LoginPage from "./pages/LoginPage.tsx";
import {useEffect} from "react";
import DashBoard from "./pages/DashBoard.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import UsersPage from "./pages/UsersPage.tsx";
import {User} from './utils/types';
import {useUserStore} from './store/userStore';
import {Spin} from 'antd';

const PrivateRoutes = ({isAuthenticated}: { isAuthenticated: boolean }) => {
    return (
        isAuthenticated ? <Outlet/> : <Navigate to='/login'/>
    )
}

const RoleBasedRoute = ({user, allowedRoles}: { user: User | null, allowedRoles: string[] }) => {

    if (!user) {
        console.log("User is not authenticated");
        return <Navigate to="/login" replace/>;
    }

    return allowedRoles.includes(user.role) ? (
        <Outlet/>
    ) : (
        <Navigate to="/unauthorized" replace/>
    );
};

export default function App() {
    const {isAuthenticated, user, rehydrate, isLoading} = useUserStore();

    useEffect(() => {
        // Beim App-Start prüfen ob der Nutzer noch angemeldet ist
        rehydrate();
    }, [rehydrate])

    // Während der Session-Prüfung einen Spinner anzeigen
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
        <Router>
            <Routes>
                <Route element={<PrivateRoutes isAuthenticated={isAuthenticated}/>}>
                    <Route path='/' element={<DashBoard/>}/>
                    <Route path='/profile' element={<ProfilePage/>}/>
                    <Route element={<RoleBasedRoute user={user} allowedRoles={['admin']}/>}>
                        <Route path='/user' element={<UsersPage/>}/>
                    </Route>
                </Route>
                <Route path='/login' element={<LoginPage/>}/>
            </Routes>
        </Router>
    )


}