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
import { CandidateLayout } from "./layouts/CandidateLayout";
import { CandidateExamSetup } from "./pages/CandidateExamSetup";
import { ExamInterface } from "./pages/ExamInterface";
import { Submissions } from "./pages/Submissions";
import { SubmissionReview } from "./pages/SubmissionReview";
import { SnapshotGallery } from "./pages/SnapshotGallery";
import { SubmissionsOverallStatistics } from "./pages/SubmissionsOverallStatistics";
import { NotificationProvider } from "./components/popupType/NotificationContext";

import { ExamStatisticsPage } from "./pages/ExamStatisticsPage";
import { Register } from "./pages/Register";

import "./App.css";

import { CandidateResults } from "./pages/CandidateResults";
import { ForgotPassword } from "./pages/ForgotPassword";
function App() {
  return (
    <AuthenticationContextProvider>
      <BrowserRouter>
        <Routes>

          <Route path="/login" element={<Login />} />
          {/* <Route path="/login" element={<Login />} /> */}
          <Route path="/register" element={<Register />} />

          <Route path="/forgot" element={<ForgotPassword />} />

          <Route element={<ProtectedRoute />}>

            <Route element={<NotificationProvider />}>
              <Route path="/candidate" element={<CandidateLayout />}>

                <Route index element={<Candidate />} />

                <Route path="dashboard" element={<Candidate />} />

                <Route path="results" element={<CandidateResults />} />

                <Route path="exam-setup" element={<CandidateExamSetup />} />

                <Route path="exam-room" element={<ExamInterface />} />

              </Route>
            </Route>


            <Route element={<AdminRoute />}>

              <Route path="/admin" element={<AdminLayout />}>


                {/* <Route index element={<Admin />} /> */}
                <Route index element={<SubmissionsOverallStatistics />} />

                <Route path="exams" element={<Admin />} />

                <Route path="users" element={<UserList />} />

                <Route path="groups" element={<GroupList />} />

                <Route path="submissions" element={<Submissions />} />

                <Route path="submissions/overall" element={<SubmissionsOverallStatistics />} />

                <Route path="submissions/:submissionId" element={<SubmissionReview />} />

                <Route path="submissions/:submissionId/snapshots" element={<SnapshotGallery />} />

                <Route path="exam-statistics/:examId" element={<ExamStatisticsPage />} />

              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthenticationContextProvider >
  );
}

export default App;
