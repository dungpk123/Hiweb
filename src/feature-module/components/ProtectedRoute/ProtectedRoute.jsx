import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'; 
import { all_routes } from "../../../Router/all_routes";
import { isTokenExpired, getLocalStorageUser } from '../../../untils/auth'; 
import { setCurrentUser } from "../../../core/redux/action"; 

const ProtectedRoute = () => {
   const router = all_routes;
   const dispatch = useDispatch(); 

  const currentUserRedux = useSelector((state) => state.current_user);
  const currentUserLocal = getLocalStorageUser();
  let isAuthenticated = !!currentUserRedux;

  if (!isAuthenticated && currentUserLocal) {
    const token = currentUserLocal.token; 
    
    if (token && !isTokenExpired(token)) {
      isAuthenticated = true; 
      dispatch(setCurrentUser(currentUserLocal));
    } else {
      localStorage.removeItem('currentUser');
    }
  } 

  if (isAuthenticated) {
    return <Outlet />;
  } 
  
  return <Navigate to={router.signinthree} replace />;
};

export default ProtectedRoute;
