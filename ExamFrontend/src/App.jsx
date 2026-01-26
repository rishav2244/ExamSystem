import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthenticationContextProvider } from "./context/AuthenticationContextProvider";

import ProtectedRoute from "./protections/ProtectedRoute";
import AdminRoute from "./protections/AdminProtectedRoute";

import { Login } from "./pages/Login";
import { Candidate } from "./pages/Candidate";
import { Admin } from "./pages/Admin";
import { UserList } from "./pages/UserList";
import { GroupList } from "./pages/GroupList";
import { AdminLayout } from "./layouts/AdminLayout";

function App() {
  return (
    <AuthenticationContextProvider>
      <BrowserRouter>
        <Routes>
          {/* public */}
          <Route path="/login" element={<Login />} />

          {/* protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/user" element={<Candidate />} />

            {/* admin-only */}
            <Route element={<AdminRoute />}>

              <Route path="/admin" element={<AdminLayout />}>

                {/* index tag makes it default view */}
                <Route index element={<Admin />} />

                <Route path="exams" element={<Admin />} />

                <Route path="users" element={<UserList />} />

                <Route path="groups" element={<GroupList />} />
                
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthenticationContextProvider>
  );
}

export default App;
