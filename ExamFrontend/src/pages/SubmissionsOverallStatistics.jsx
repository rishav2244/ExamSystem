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
                <div className="leaderboard-card">
                    <div className="leaderboard-header">
                        <h3>Top 5 Exams</h3>
                        <span>Based on Highest Score</span>
                    </div>

                    <div className="leaderboard-list">
                        {stats.highestRecords.slice(0, 5).map((rec, index) => (
                            <div key={index} className="leaderboard-item">

                                <div className="leaderboard-left">
                                    <span className="leaderboard-rank">#{index + 1}</span>
                                    <span className="leaderboard-title">{rec.title}</span>
                                </div>

                                <div className="leaderboard-score">
                                    {rec.score}
                                </div>

                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="extrema-tables-section">
                <div className="extrema-column">
                    <h4>Top Performing Exam</h4>

                    <div className="extrema-list">
                        {stats.highestRecords[0] && (
                            <div className="extrema-item high">
                                <span>{stats.highestRecords[0].title}</span>
                                <strong>{stats.highestRecords[0].score}</strong>
                            </div>
                        )}
                    </div>
                </div>
                <div className="extrema-column">
                    <h4>Exam Needing Review</h4>

                    <div className="extrema-list">
                        {stats.lowestRecords[0] && (
                            <div className="extrema-item low">
                                <span>{stats.lowestRecords[0].title}</span>
                                <strong>{stats.lowestRecords[0].score}</strong>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};