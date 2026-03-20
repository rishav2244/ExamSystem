import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSubmissionsOverview } from '../api/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export const SubmissionsOverallStatistics = () => {
    const [stats, setStats] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        getSubmissionsOverview().then(setStats).catch(console.error);
    }, []);

    if (!stats) return <div className="stats-loading">Loading Statistics...</div>;

    const pieData = [
        { name: 'Passed', value: stats.totalPassed, color: '#4CAF50' },
        { name: 'Failed', value: stats.totalFailed, color: '#F44336' }
    ];

    return (
        <div className="overall-stats-container">
            <div className="stats-navigation-bar">
                <button className="btn-stats-back" onClick={() => navigate(-1)}>
                    &larr; Back to Submissions
                </button>
                <h2>Global Performance Overview</h2>
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
                    <strong>{stats.averageScore?.toFixed(2)}%</strong>
                </div>
            </div>

            <div className="stats-charts-section">
                <div className="chart-wrapper">
                    <h3>Pass vs Fail Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-wrapper">
                    <h3>Highest Performers (by Exam)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats.highestRecords}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="title" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="score" fill="#2196F3" name="Score" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="extrema-tables-section">
                <div className="extrema-column">
                    <h4>Top Performing Exams</h4>
                    <div className="extrema-list">
                        {stats.highestRecords.map((rec, i) => (
                            <div key={i} className="extrema-item high">
                                <span>{rec.title}</span>
                                <strong>{rec.score}</strong>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="extrema-column">
                    <h4>Exams Needing Review (Lowest)</h4>
                    <div className="extrema-list">
                        {stats.lowestRecords.map((rec, i) => (
                            <div key={i} className="extrema-item low">
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