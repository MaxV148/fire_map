import React from 'react';
import NavBase from "../components/NavBase.tsx";


const UsersPage: React.FC = () => {

    const content = <>
        <div style={{ height: '100%' }}>
            <h1>Users</h1>
        </div>
    </>
    return (
       <NavBase content={content}/>
    );
};

export default UsersPage;