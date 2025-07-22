const { useState, useEffect, useMemo } = React;

/**
 * Renders the main view for managing projects.
 * @param {object} props - The component props.
 * @param {Array<object>} props.projects - The list of all projects.
 * @param {boolean} props.loading - The loading state for the projects data.
 * @param {string|null} props.error - The error message, if any.
 * @param {Function} props.setProjects - Function to update the projects list in the parent component.
 * @param {Function} props.onSelectProject - Callback to view the details of a single project.
 */
function ProjectsView({ projects: initialProjects, loading, error, setProjects, onSelectProject }) {
    // State for the search and filter inputs
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    
    // State for managing the create/edit modal form
    const [showForm, setShowForm] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [projectFormData, setProjectFormData] = useState({ name: '', description: '', budget: '', location: '', status: 'planning', progress: 0 });

    // Effect to re-render Lucide icons when the data or view changes
    useEffect(() => {
        lucide.createIcons();
    }, [initialProjects, searchTerm, filterStatus]);

    // Memoized filtering to avoid re-calculating on every render
    const filteredProjects = useMemo(() => {
        if (!initialProjects) return [];
        return initialProjects.filter(project => {
            const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 (project.location && project.location.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
            return matchesSearch && matchesFilter;
        });
    }, [initialProjects, searchTerm, filterStatus]);

    // Helper to get tailwind classes based on project status
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'planning': return 'bg-blue-100 text-blue-800';
            case 'on_hold': return 'bg-yellow-100 text-yellow-800';
            case 'completed': return 'bg-slate-100 text-slate-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    // --- CRUD Handlers ---

    const openForm = (project = null) => {
        if (project) {
            setProjectFormData(project);
            setEditingProject(project);
        } else {
            setProjectFormData({ name: '', description: '', budget: '', location: '', status: 'planning', progress: 0 });
            setEditingProject(null);
        }
        setShowForm(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProject) {
                const response = await api.put(`/projects/${editingProject.id}`, projectFormData);
                setProjects(prev => prev.map(p => p.id === editingProject.id ? response.data : p));
            } else {
                const response = await api.post('/projects', projectFormData);
                setProjects(prev => [response.data, ...prev]);
            }
            setShowForm(false);
        } catch (err) {
            console.error("Failed to save project:", err);
            alert("Error: Could not save the project.");
        }
    };

    const handleDeleteProject = async (projectId) => {
        if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            try {
                await api.delete(`/projects/${projectId}`);
                setProjects(prev => prev.filter(p => p.id !== projectId));
            } catch (err) {
                console.error("Failed to delete project:", err);
                alert("Error: Could not delete the project.");
            }
        }
    };

    if (loading) return <p className="text-center text-slate-500">Loading projects...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
                    <p className="text-slate-600">Manage and monitor all your construction projects</p>
                </div>
                 <button onClick={() => openForm()} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors">
                    <i data-lucide="plus" className="h-5 w-5"></i>
                    <span>New Project</span>
                </button>
            </div>

            {/* --- Create/Edit Modal Form --- */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                        <h2 className="text-xl font-semibold mb-4">{editingProject ? 'Edit Project' : 'Create New Project'}</h2>
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <input type="text" placeholder="Project Name" value={projectFormData.name} onChange={e => setProjectFormData({...projectFormData, name: e.target.value})} className="w-full p-2 border rounded" required/>
                            <textarea placeholder="Description" value={projectFormData.description} onChange={e => setProjectFormData({...projectFormData, description: e.target.value})} className="w-full p-2 border rounded"></textarea>
                            <input type="text" placeholder="Location" value={projectFormData.location} onChange={e => setProjectFormData({...projectFormData, location: e.target.value})} className="w-full p-2 border rounded"/>
                            <input type="number" placeholder="Budget" value={projectFormData.budget} onChange={e => setProjectFormData({...projectFormData, budget: parseFloat(e.target.value) || 0})} className="w-full p-2 border rounded"/>
                            <div className="flex justify-end space-x-4">
                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
                                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">{editingProject ? 'Save Changes' : 'Create Project'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- Filters Section --- */}
            <div className="bg-white rounded-lg shadow-sm border p-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="relative flex-1 w-full max-w-md">
                    <i data-lucide="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5"></i>
                    <input
                        type="text"
                        placeholder="Search by name or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg"
                    />
                </div>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 w-full md:w-auto">
                    <option value="all">All Statuses</option>
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                </select>
            </div>

            {/* --- Projects Grid --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                    <div key={project.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow flex flex-col justify-between p-6">
                        <div>
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-lg font-semibold text-slate-900 mb-1">{project.name}</h3>
                                <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(project.status)}`}>
                                    {project.status.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="space-y-3 mb-4 text-sm text-slate-600">
                                <p className="flex items-center"><i data-lucide="map-pin" className="h-4 w-4 mr-2 text-slate-400"></i> {project.location}</p>
                                <p className="flex items-center"><i data-lucide="dollar-sign" className="h-4 w-4 mr-2 text-slate-400"></i> ${project.budget.toLocaleString()} Budget</p>
                            </div>
                            <div className="mb-4">
                                <div className="flex justify-between mb-1 text-sm"><span className="font-medium text-slate-700">Progress</span><span className="font-medium text-slate-700">{project.progress}%</span></div>
                                <div className="w-full bg-slate-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${project.progress}%` }}></div></div>
                            </div>
                        </div>
                        <div className="border-t pt-4 flex justify-between items-center">
                            <button onClick={() => onSelectProject(project.id)} className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">
                                View Details
                            </button>
                            <div className="flex space-x-3">
                                 <button onClick={() => openForm(project)} className="text-sm font-medium text-blue-600 hover:text-blue-800">Edit</button>
                                 <button onClick={() => handleDeleteProject(project.id)} className="text-sm font-medium text-red-600 hover:text-red-800">Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
             {filteredProjects.length === 0 && <div className="text-center text-slate-500 py-10 bg-white rounded-lg border shadow-sm"><p>No projects match your criteria.</p></div>}
        </div>
    );
}
