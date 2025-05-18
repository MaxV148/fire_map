import {BrowserRouter as Router, Routes, Route, Navigate, Outlet} from 'react-router-dom';
import LoginPage from "./pages/LoginPage.tsx";
import {useEffect} from "react";
import DashBoard from "./pages/DashBoard.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import UsersPage from "./pages/UsersPage.tsx";
import {User} from './utils/types';
import {useUserStore} from './store/userStore';

const PrivateRoutes = ({isAuthenticated}: { isAuthenticated: boolean }) => {
    return (
        isAuthenticated ? <Outlet/> : <Navigate to='/login'/>
    )
}

const RoleBasedRoute = ({user, allowedRoles}: { user: User, allowedRoles: string[] }) => {

    if (!user) {
        return <Navigate to="/login" replace/>;
    }

    return allowedRoles.includes(user.role) ? (
        <Outlet/>
    ) : (
        <Navigate to="/unauthorized" replace/>
    );
};

export default function App() {
    const {isAuthenticated, user} = useUserStore();

    useEffect(() => {

    }, [])


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