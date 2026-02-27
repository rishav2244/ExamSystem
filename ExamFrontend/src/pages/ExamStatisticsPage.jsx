// // import { useLocation, useNavigate } from "react-router-dom";
// // import { useMemo } from "react";

// // export const ExamStatisticsPage = () => {
// //     const { state } = useLocation();
// //     const navigate = useNavigate();

// //     const { exam, submissions } = state || {};

// //     const stats = useMemo(() => {
// //         if (!submissions || submissions.length === 0) return null;

// //         const total = submissions.length;

// //         const passed = submissions.filter(s => s.passed).length;
// //         const failed = total - passed;

// //         const avgScore =
// //             submissions.reduce((sum, s) => sum + (s.score || 0), 0) / total;

// //         const avgTime =
// //             submissions.reduce((sum, s) => sum + (s.timeTaken || 0), 0) / total;

// //         const totalViolations =
// //             submissions.reduce((sum, s) => sum + (s.violations || 0), 0);

// //         const highestScore = Math.max(...submissions.map(s => s.score || 0));
// //         const lowestScore = Math.min(...submissions.map(s => s.score || 0));

// //         return {
// //             total,
// //             passed,
// //             failed,
// //             avgScore,
// //             avgTime,
// //             totalViolations,
// //             highestScore,
// //             lowestScore
// //         };
// //     }, [submissions]);

// //     if (!stats) return <p>No statistics available</p>;

// //     return (
// //         <div className="stats-page">
// //             <button onClick={() => navigate(-1)}>⬅ Back</button>

// //             <h2>Exam Statistics — {exam.title}</h2>

// //             <div className="stats-grid">

// //                 <div className="stat-card">
// //                     <h3>Total Submissions</h3>
// //                     <p>{stats.total}</p>
// //                 </div>

// //                 <div className="stat-card">
// //                     <h3>Pass Rate</h3>
// //                     <p>
// //                         {((stats.passed / stats.total) * 100).toFixed(1)}%
// //                     </p>
// //                 </div>

// //                 <div className="stat-card">
// //                     <h3>Average Score</h3>
// //                     <p>{stats.avgScore.toFixed(2)}</p>
// //                 </div>

// //                 <div className="stat-card">
// //                     <h3>Highest Score</h3>
// //                     <p>{stats.highestScore.toFixed(2)}</p>
// //                 </div>

// //                 <div className="stat-card">
// //                     <h3>Lowest Score</h3>
// //                     <p>{stats.lowestScore.toFixed(2)}</p>
// //                 </div>

// //                 <div className="stat-card">
// //                     <h3>Average Time Taken</h3>
// //                     <p>{stats.avgTime.toFixed(1)} min</p>
// //                 </div>

// //                 <div className="stat-card">
// //                     <h3>Total Violations</h3>
// //                     <p>{stats.totalViolations}</p>
// //                 </div>

// //             </div>
// //         </div>
// //     );
// // };

// import { useLocation, useNavigate } from "react-router-dom";
// import { useMemo } from "react";
// import {
//     BarChart,
//     Bar,
//     XAxis,
//     YAxis,
//     Tooltip,
//     CartesianGrid,
//     PieChart,
//     Pie,
//     Cell,
//     ResponsiveContainer
// } from "recharts";

// export const ExamStatisticsPage = () => {
//     const { state } = useLocation();
//     const navigate = useNavigate();

//     const { exam, submissions } = state || {};

//     const stats = useMemo(() => {
//         if (!submissions?.length) return null;

//         const total = submissions.length;
//         const passed = submissions.filter(s => s.passed).length;
//         const failed = total - passed;

//         const avgScore =
//             submissions.reduce((a, s) => a + (s.score || 0), 0) / total;

//         const avgTime =
//             submissions.reduce((a, s) => a + (s.timeTaken || 0), 0) / total;

//         // ✅ Score ranges for BAR GRAPH
//         const ranges = {
//             "0-20": 0,
//             "21-40": 0,
//             "41-60": 0,
//             "61-80": 0,
//             "81-100": 0
//         };

//         submissions.forEach(s => {
//             const score = s.score || 0;
//             if (score <= 20) ranges["0-20"]++;
//             else if (score <= 40) ranges["21-40"]++;
//             else if (score <= 60) ranges["41-60"]++;
//             else if (score <= 80) ranges["61-80"]++;
//             else ranges["81-100"]++;
//         });

//         const barData = Object.entries(ranges).map(([range, count]) => ({
//             range,
//             count
//         }));

//         const pieData = [
//             { name: "Pass", value: passed },
//             { name: "Fail", value: failed }
//         ];

//         return {
//             total,
//             passed,
//             failed,
//             avgScore,
//             avgTime,
//             barData,
//             pieData
//         };
//     }, [submissions]);

//     if (!stats) return <p>No data available</p>;

//     return (
//         <div className="stats-dashboard">

//             <button className="back-btn" onClick={() => navigate(-1)}>
//                 ⬅ Back
//             </button>

//             <h2>{exam.title} — Analytics Dashboard</h2>

//             {/* ===== STAT CARDS ===== */}
//             <div className="stats-cards">
//                 <div className="stat-card">
//                     <h4>Total Submissions</h4>
//                     <p>{stats.total}</p>
//                 </div>

//                 <div className="stat-card">
//                     <h4>Pass Rate</h4>
//                     <p>
//                         {((stats.passed / stats.total) * 100).toFixed(1)}%
//                     </p>
//                 </div>

//                 <div className="stat-card">
//                     <h4>Average Score</h4>
//                     <p>{stats.avgScore.toFixed(2)}</p>
//                 </div>

//                 <div className="stat-card">
//                     <h4>Avg Time Taken</h4>
//                     <p>{stats.avgTime.toFixed(1)} min</p>
//                 </div>
//             </div>

//             {/* ===== CHART SECTION ===== */}
//             <div className="charts-container">

//                 {/* BAR GRAPH */}
//                 <div className="chart-box">
//                     <h3>Score Distribution</h3>
//                     <ResponsiveContainer width="100%" height={300}>
//                         <BarChart data={stats.barData}>
//                             <CartesianGrid strokeDasharray="3 3" />
//                             <XAxis dataKey="range" />
//                             <YAxis />
//                             <Tooltip />
//                             <Bar dataKey="count" />
//                         </BarChart>
//                     </ResponsiveContainer>
//                 </div>

//                 {/* PIE CHART */}
//                 <div className="chart-box">
//                     <h3>Pass vs Fail</h3>
//                     <ResponsiveContainer width="100%" height={300}>
//                         <PieChart>
//                             <Pie
//                                 data={stats.pieData}
//                                 dataKey="value"
//                                 nameKey="name"
//                                 outerRadius={100}
//                                 label
//                             >
//                                 <Cell />
//                                 <Cell />
//                             </Pie>
//                             <Tooltip />
//                         </PieChart>
//                     </ResponsiveContainer>
//                 </div>

//             </div>
//         </div>
//     );
// };
import { useLocation, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Legend
} from "recharts";

export const ExamStatisticsPage = () => {

    const { state } = useLocation();
    const navigate = useNavigate();

    const { exam, submissions } = state || {};

    const stats = useMemo(() => {

        if (!submissions || submissions.length === 0)
            return null;

        const total = submissions.length;

        const passed = submissions.filter(s => s.passed).length;
        const failed = total - passed;

        const avgScore =
            submissions.reduce((sum, s) => sum + (s.score || 0), 0) / total;

        const avgTime =
            submissions.reduce((sum, s) => sum + (s.timeTaken || 0), 0) / total;

        /* ===============================
           ✅ DYNAMIC SCORE DISTRIBUTION
        =============================== */

        const scores = submissions.map(s => s.score || 0);

        const minScore = Math.min(...scores);
        const maxScore = Math.max(...scores);

        const bucketCount = 6;
        const interval =
            Math.ceil((maxScore - minScore + 1) / bucketCount) || 1;

        const buckets = [];

        for (let i = 0; i < bucketCount; i++) {

            const start = minScore + i * interval;
            const end = start + interval - 1;

            buckets.push({
                range: `${start}-${end}`,
                count: 0
            });
        }

        scores.forEach(score => {
            const index = Math.min(
                Math.floor((score - minScore) / interval),
                bucketCount - 1
            );
            buckets[index].count++;
        });

        const pieData = [
            { name: "Pass", value: passed },
            { name: "Fail", value: failed }
        ];

        return {
            total,
            passed,
            failed,
            avgScore,
            avgTime,
            barData: buckets,
            pieData
        };

    }, [submissions]);

    if (!stats) return <p>No statistics available</p>;

    /* ===============================
       🎨 COLORS
    =============================== */

    const COLORS = [
        "#6366f1",
        "#22c55e",
        "#f59e0b",
        "#ef4444",
        "#06b6d4",
        "#a855f7"
    ];

    const PIE_COLORS = ["#22c55e", "#ef4444"];

    return (
        <div className="stats-dashboard">

            <button
                className="back-btn"
                onClick={() => navigate(-1)}
            >
                ⬅ Back
            </button>

            <h2>{exam.title} — Analytics Dashboard</h2>

            {/* ===============================
               STAT CARDS
            =============================== */}

            <div className="stats-cards">

                <div className="stat-card">
                    <h4>Total Submissions</h4>
                    <p>{stats.total}</p>
                </div>

                <div className="stat-card">
                    <h4>Pass Rate</h4>
                    <p>
                        {((stats.passed / stats.total) * 100).toFixed(1)}%
                    </p>
                </div>

                <div className="stat-card">
                    <h4>Average Score</h4>
                    <p>{stats.avgScore.toFixed(2)}</p>
                </div>

                <div className="stat-card">
                    <h4>Avg Time Taken</h4>
                    <p>{stats.avgTime.toFixed(1)} min</p>
                </div>

            </div>

            {/* ===============================
               CHARTS
            =============================== */}

            <div className="charts-container">

                {/* ===== BAR CHART ===== */}
                <div className="chart-box">
                    <h3>Score Distribution</h3>

                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={stats.barData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="range" />
                            <YAxis />
                            <Tooltip />

                            <Bar
                                dataKey="count"
                                radius={[8, 8, 0, 0]}
                                animationDuration={900}
                            >
                                {stats.barData.map((_, index) => (
                                    <Cell
                                        key={index}
                                        fill={
                                            COLORS[
                                            index % COLORS.length
                                            ]
                                        }
                                    />
                                ))}
                            </Bar>

                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* ===== PIE CHART ===== */}
                {/* <div className="chart-box">
                    <h3>Pass vs Fail</h3>

                    <ResponsiveContainer width="100%" height={320}>
                        <PieChart>
                            <Pie
                                data={stats.pieData}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={110}
                                label
                                animationDuration={900}
                            >
                                {stats.pieData.map((_, index) => (
                                    <Cell
                                        key={index}
                                        fill={PIE_COLORS[index]}
                                    />
                                ))}
                            </Pie>

                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div> */}
                <div className="chart-box">
                    <h3>Pass vs Fail</h3>

                    <div className="pie-wrapper">

                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie
                                    data={stats.pieData}
                                    dataKey="value"
                                    nameKey="name"
                                    outerRadius={90}
                                    // label
                                    animationDuration={900}
                                >
                                    <Cell fill="#22c55e" />
                                    <Cell fill="#ef4444" />
                                </Pie>

                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* ✅ CUSTOM LEGEND */}
                        <div className="pie-legend">
                            <div className="legend-item">
                                <span className="legend-color pass"></span>
                                Pass
                            </div>

                            <div className="legend-item">
                                <span className="legend-color fail"></span>
                                Fail
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};