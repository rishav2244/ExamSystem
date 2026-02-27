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
                Back
            </button>

            <h2>{exam.title} — Analytics Dashboard</h2>

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


            <div className="charts-container">

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