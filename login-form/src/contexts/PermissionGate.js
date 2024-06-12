import React, { useContext } from 'react';
import { AuthContext, AUTH_STATE_CHANGED } from "./auth.contexts";


const PermissionGate = ({ permission, children })=>{
    const authContext = useContext(AuthContext);    
    return <>{authContext.authState.user && authContext.authState.user.permissions.includes(permission)?<>{children}</>:<></>}</>
}


export default PermissionGate;
