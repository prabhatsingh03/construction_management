const { useState, useEffect } = React;

// --- Axios Authenticated Instance ---
// This creates a global axios instance that automatically attaches the JWT token
// to the headers of every request, which is necessary for accessing protected API routes.
const api = axios.create({
    baseURL: '/api'
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});



// --- Reusable Data Fetching Hook ---
// A custom hook to simplify fetching data from an endpoint.
// It handles loading and error states automatically.
function useData(endpoint) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Only fetch data if an endpoint is provided.
        if (!endpoint) {
            setLoading(false);
            return;
        };

        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await api.get(endpoint);
                setData(response.data);
                setError(null);
            } catch (err) {
                console.error(`Error fetching ${endpoint}:`, err);
                if (err.response?.status === 401) {
                    setError(`Authentication failed. Your session may have expired.`);
                } else if (err.response?.status === 422) {
                    setError(`Invalid request format for ${endpoint}.`);
                } else {
                    setError(`Failed to fetch ${endpoint}. ${err.response?.data?.error || 'Please try again.'}`);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [endpoint]); // Refetch when the endpoint changes

    return { data, loading, error, setData };
}

// --- Main Application Component ---
function App() {
    // State to track if the user is logged in
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));
    // State to track the currently active section in the sidebar
    const [activeSection, setActiveSection] = useState('dashboard');
    // State to track if a specific project has been selected for detailed view
    const [selectedProjectId, setSelectedProjectId] = useState(null);

    // Fetch all projects if the user is authenticated. This data is passed down to child components.
    const { data: projects, loading: projectsLoading, error: projectsError, setData: setProjects } = useData(isAuthenticated ? 'projects' : null);

    // Handler to update state upon successful login
    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    // Handler to clear session and update state on logout
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
        setSelectedProjectId(null); // Clear selected project on logout
    };

    // If the user is not authenticated, render the login form.
    if (!isAuthenticated) {
        return <LoginForm onLogin={handleLogin} />;
    }
    
    // Simple router to determine which component to display in the main content area.
    const renderContent = () => {
        // If a project is selected, always show the detail view regardless of the active section.
        if (selectedProjectId) {
            const selectedProject = projects.find(p => p.id === selectedProjectId);
            // Show a loading message if projects are still being fetched
            if (!selectedProject) return <p>Loading project details...</p>;
            return <ProjectDetailView project={selectedProject} onBack={() => setSelectedProjectId(null)} />;
        }
        
        // Otherwise, show the view corresponding to the selected sidebar item.
        switch (activeSection) {
            case 'dashboard': 
                return <DashboardView projects={projects} loading={projectsLoading} error={projectsError} />;
            case 'projects': 
                return <ProjectsView projects={projects} loading={projectsLoading} error={projectsError} setProjects={setProjects} onSelectProject={setSelectedProjectId} />;
            case 'documents': 
                return <CrudView title="Documents" endpoint="documents" fields={[{name: 'name', placeholder: 'Document Name'}]} projects={projects} />;
            case 'preconstruction': 
                return <CrudView title="Bids" endpoint="bids" fields={[{name: 'title', placeholder: 'Bid Title'}, {name: 'amount', placeholder: 'Amount', type: 'number'}]} projects={projects} />;
            case 'financials': 
                return <CrudView title="Change Orders" endpoint="change_orders" fields={[{name: 'title', placeholder: 'Order Title'}, {name: 'amount', placeholder: 'Amount', type: 'number'}]} projects={projects} />;
            case 'quality-safety': 
                return <CrudView title="Inspections" endpoint="inspections" fields={[{name: 'title', placeholder: 'Inspection Title'}]} projects={projects} />;
            default: 
                return <DashboardView projects={projects} loading={projectsLoading} error={projectsError} />;
        }
    };

    return (
        <div className="flex bg-slate-100 h-screen">
            <Sidebar 
                activeSection={activeSection} 
                onSectionChange={(section) => {
                    setActiveSection(section);
                    setSelectedProjectId(null); // Deselect project when changing sections
                }} 
                onLogout={handleLogout} 
            />
            <main className="flex-1 p-6 overflow-auto">
                {renderContent()}
            </main>
        </div>
    );
}

// --- Render the App ---
// Find the root DOM element and render the main App component into it.
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
