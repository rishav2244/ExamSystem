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
import { CandidateExamSetup } from "./pages/CandidateExamSetup";
import { ExamInterface } from "./pages/ExamInterface";
import { Submissions } from "./pages/Submissions";
import { SubmissionReview } from "./pages/SubmissionReview";
import { SnapshotGallery } from "./pages/SnapshotGallery";
import { SubmissionsOverallStatistics } from "./pages/SubmissionsOverallStatistics";

import { ExamStatisticsPage } from "./pages/ExamStatisticsPage";
import { Register } from "./pages/Register";

import { CandidateResults } from "./pages/CandidateResults";
function App() {
  return (
    <AuthenticationContextProvider>
      <BrowserRouter>
        <Routes>

          <Route path="/login" element={<Login />} />
          {/* <Route path="/login" element={<Login />} /> */}
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/user" element={<Candidate />} />

            <Route path="/candidate/exam-setup" element={<CandidateExamSetup />} />

            <Route path="/candidate/exam-room" element={<ExamInterface />} />


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

                <Route path="/admin/exam-statistics/:examId" element={<ExamStatisticsPage />} />

              </Route>
            </Route>
          </Route>
          <Route path="/candidate/results" element={<CandidateResults />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthenticationContextProvider>
  );
}

export default App;
