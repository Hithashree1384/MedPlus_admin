import React from 'react'
import Hero from './pages/Hero'
import { Routes,Route ,Link} from 'react-router-dom'
import Home from './pages/Home'
import { useUser } from '@clerk/react';
import Add from './pages/Add';
import List from './pages/List'
import Appointment from './pages/Appointment';
import ServiceDashboard from './components/ServiceDashboard';
import Addserv from './pages/Addserv';
import ListServ from './pages/ListServ';
import ServiceAppoint from './pages/ServiceAppoint';
function RequireAuth({ children }) {
  const {isLoaded,isSignedIn}= useUser();

  if(!isLoaded){
    return null;}
  if (!isSignedIn)
  return (
    <div className="min-h-screen font-mono flex items-center justify-center bg-gradient-to-b from-cyan-50 via-teal-50 to-cyan-100 px-4">
      
      <div className="text-center">
        <p className="text-cyan-800 font-semibold text-lg sm:text-2xl mb-4 animate-fade-in">
          Please sign in to view this page
        </p>

        <div className="flex justify-center">
          <Link to="/" className="px-6 py-2 text-sm rounded-full bg-cyan-600 text-white shadow-sm hover:bg-cyan-700 hover:shadow-md transition-all duration-300 ease-in-out animate-bounce-subtle">
            Home
          </Link>
        </div>
      </div>

    </div>
  );
  return children;
}

const App = () => {
  return (
<>
<Routes>
  <Route path='/' element={<Hero/>}/>
  <Route path='/h' element={<RequireAuth><Home/></RequireAuth>}/>
  <Route path='/add' element={<RequireAuth><Add/></RequireAuth>}/>
  <Route path='/list' element={<RequireAuth><List/></RequireAuth>}/>
  <Route path='/appointments' element={<RequireAuth><Appointment/></RequireAuth>}/>
  <Route path='/service-dashboard' element={<RequireAuth><ServiceDashboard/></RequireAuth>}/>
  <Route path='/add-service' element={<RequireAuth><Addserv/></RequireAuth>}/>
  <Route path='/list-service' element={<RequireAuth><ListServ/></RequireAuth>}/>
  <Route path='/service-appointments' element={<RequireAuth><ServiceAppoint/></RequireAuth>}/>
</Routes>
</>
  )
}

export default App
