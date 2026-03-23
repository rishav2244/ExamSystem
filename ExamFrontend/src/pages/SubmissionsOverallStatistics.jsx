import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSubmissionsOverview } from '../api/api';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';

export const SubmissionsOverallStatistics = () => {
    const [stats, setStats] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        getSubmissionsOverview()
            .then(setStats)
            .catch(console.error);
    }, []);

    if (!stats) {
        return <div className="stats-loading">Loading Statistics...</div>;
    }

    const pieData = [
        { name: 'Passed', value: stats.totalPassed, color: '#22c55e' },
        { name: 'Failed', value: stats.totalFailed, color: '#ef4444' }
    ];
    const comparisonData = stats.highestRecords
        .slice(0, 6)
        .map(item => ({
            title: item.title,
            topScore: item.score,
            avgScore: stats.averageScore
        }));

    return (
        <div className="overall-stats-container">

            {/* Header */}
            <div className="stats-header">
                <button
                    className="btn-stats-back"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>

                <div>
                    <h2>Global Performance Overview</h2>
                    <p className="stats-subtitle">
                        Insights across all exams
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="stats-summary-grid">
                <div className="stats-card-mini">
                    <span>Total Exams</span>
                    <strong>{stats.totalExams}</strong>
                </div>

                <div className="stats-card-mini">
                    <span>Candidates Appeared</span>
                    <strong>{stats.candidatesAppeared}</strong>
                </div>

                <div className="stats-card-mini">
                    <span>Average Score</span>
                    <strong>
                        {stats.averageScore?.toFixed(2)}
                    </strong>
                </div>
            </div>

            {/* Charts */}
            <div className="stats-charts-section">

                <div className="chart-card">
                    <h3>Pass vs Fail Distribution</h3>

                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={90}
                                label
                            >
                                {pieData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="table-card">
                    <div className="table-card-header">
                        <h3>Top 5 Exams</h3>
                        <span className="table-subtitle">Based on highest scores</span>
                    </div>

                    <div className="stats-table">
                        <div className="stats-table-header">
                            <span>Rank</span>
                            <span>Exam</span>
                            <span>Top Score</span>
                        </div>

                        {stats.highestRecords.slice(0, 5).map((rec, index) => (
                            <div key={index} className="stats-table-row">
                                <span className="rank">#{index + 1}</span>

                                <span className="exam-title">
                                    {rec.title}
                                </span>

                                <span className="score">
                                    {rec.score}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Extremes */}
            <div className="extrema-tables-section">

                <div className="extrema-column">
                    <h4>Top Performing Exams</h4>

                    <div className="extrema-list">
                        {stats.highestRecords.map((rec, i) => (
                            <div
                                key={i}
                                className="extrema-item high"
                            >
                                <span>{rec.title}</span>
                                <strong>{rec.score}</strong>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="extrema-column">
                    <h4>Exams Needing Review</h4>

                    <div className="extrema-list">
                        {stats.lowestRecords.map((rec, i) => (
                            <div
                                key={i}
                                className="extrema-item low"
                            >
                                <span>{rec.title}</span>
                                <strong>{rec.score}</strong>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

        </div>
    );
};