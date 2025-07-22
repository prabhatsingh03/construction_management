const { useEffect, useRef } = React;

/**
 * Displays the main dashboard with summary cards and charts.
 * @param {object} props - The component props.
 * @param {Array<object>} props.projects - The list of all projects.
 * @param {boolean} props.loading - The loading state for the projects data.
 * @param {string|null} props.error - The error message, if any.
 */
function DashboardView({ projects, loading, error }) {
    const progressChartRef = useRef(null);
    const statusChartRef = useRef(null);
    
    // Refs to store the Chart.js instances to prevent memory leaks
    const progressChartInstance = useRef(null);
    const statusChartInstance = useRef(null);

    useEffect(() => {
        // Ensure Lucide icons are rendered after the component mounts or updates
        lucide.createIcons();

        // Destroy previous chart instances before creating new ones
        if (progressChartInstance.current) {
            progressChartInstance.current.destroy();
        }
        if (statusChartInstance.current) {
            statusChartInstance.current.destroy();
        }

        // Render charts only if there is data and the canvas elements are available
        if (projects && projects.length > 0) {
            // --- Project Progress Chart (Bar) ---
            if (progressChartRef.current) {
                const progressCtx = progressChartRef.current.getContext('2d');
                progressChartInstance.current = new Chart(progressCtx, {
                    type: 'bar',
                    data: {
                        labels: projects.map(p => p.name),
                        datasets: [{
                            label: 'Progress (%)',
                            data: projects.map(p => p.progress),
                            backgroundColor: 'rgba(59, 130, 246, 0.7)',
                            borderColor: 'rgba(59, 130, 246, 1)',
                            borderWidth: 1,
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: { 
                            legend: { display: false },
                            title: { display: true, text: 'Project Progress Overview', font: { size: 16 } } 
                        },
                        scales: {
                            y: { max: 100, beginAtZero: true }
                        }
                    }
                });
            }

            // --- Project Status Chart (Pie) ---
            const statusCounts = projects.reduce((acc, p) => {
                const status = p.status || 'Unknown';
                acc[status] = (acc[status] || 0) + 1;
                return acc;
            }, {});
            
            if (statusChartRef.current) {
                const statusCtx = statusChartRef.current.getContext('2d');
                statusChartInstance.current = new Chart(statusCtx, {
                    type: 'pie',
                    data: {
                        labels: Object.keys(statusCounts),
                        datasets: [{
                            data: Object.values(statusCounts),
                            backgroundColor: ['#34D399', '#60A5FA', '#FBBF24', '#9CA3AF'],
                            hoverOffset: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: { 
                            title: { display: true, text: 'Project Status Distribution', font: { size: 16 } } 
                        }
                    }
                });
            }
        }
    }, [projects]); // This effect re-runs whenever the projects data changes

    if (loading) return <p className="text-center text-slate-500">Loading dashboard data...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const actualCosts = projects.reduce((sum, p) => sum + (p.actual_cost || 0), 0);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>

            {/* --- Key Metric Cards --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full"><i data-lucide="folder-open" className="h-6 w-6 text-blue-600"></i></div>
                    <div>
                        <p className="text-slate-500 text-sm">Total Projects</p>
                        <p className="text-2xl font-bold text-slate-800">{projects.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
                    <div className="bg-green-100 p-3 rounded-full"><i data-lucide="dollar-sign" className="h-6 w-6 text-green-600"></i></div>
                    <div>
                        <p className="text-slate-500 text-sm">Total Budget</p>
                        <p className="text-2xl font-bold text-slate-800">${(totalBudget / 1000000).toFixed(1)}M</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
                    <div className="bg-yellow-100 p-3 rounded-full"><i data-lucide="wallet" className="h-6 w-6 text-yellow-600"></i></div>
                    <div>
                        <p className="text-slate-500 text-sm">Total Spent</p>
                        <p className="text-2xl font-bold text-slate-800">${(actualCosts / 1000000).toFixed(1)}M</p>
                    </div>
                </div>
            </div>

            {/* --- Charts Section --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <canvas ref={progressChartRef}></canvas>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <canvas ref={statusChartRef}></canvas>
                </div>
            </div>
        </div>
    );
}
