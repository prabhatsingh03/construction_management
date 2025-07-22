const { useState, useEffect } = React;

/**
 * Renders a detailed view of a single project with multiple tabs.
 * @param {object} props - The component props.
 * @param {object} props.project - The project object containing all its details and related items.
 * @param {Function} props.onBack - A callback function to return to the projects list view.
 */
function ProjectDetailView({ project, onBack }) {
    // State to manage the currently active tab
    const [activeTab, setActiveTab] = useState('summary');

    // Effect to re-render Lucide icons when the component mounts or the tab changes
    useEffect(() => {
        lucide.createIcons();
    }, [activeTab]);

    // A small helper component for rendering tab buttons
    const TabButton = ({ id, label, count }) => (
        <button 
            onClick={() => setActiveTab(id)}
            className={`py-2 px-4 text-sm font-medium rounded-md flex items-center space-x-2 ${
                activeTab === id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-600 hover:bg-slate-100'
            }`}
        >
            <span>{label}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === id ? 'bg-blue-400' : 'bg-slate-200'}`}>{count}</span>
        </button>
    );

    // Renders the content based on the active tab
    const renderTabContent = () => {
        switch(activeTab) {
            case 'documents':
                return (
                    <div className="space-y-3">
                        {project.documents.length > 0 ? project.documents.map(d => 
                            <div key={d.id} className="p-3 bg-slate-50 rounded-md border">{d.name}</div>
                        ) : <p>No documents for this project.</p>}
                    </div>
                );
            case 'bids':
                return (
                    <div className="space-y-3">
                        {project.bids.length > 0 ? project.bids.map(b => 
                            <div key={b.id} className="p-3 bg-slate-50 rounded-md border flex justify-between">
                                <span>{b.title}</span>
                                <span className="font-medium">${b.amount.toLocaleString()}</span>
                            </div>
                        ) : <p>No bids for this project.</p>}
                    </div>
                );
            case 'financials':
                return (
                     <div className="space-y-3">
                        {project.change_orders.length > 0 ? project.change_orders.map(c => 
                            <div key={c.id} className={`p-3 bg-slate-50 rounded-md border flex justify-between ${c.amount >= 0 ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}`}>
                                <span>{c.title}</span>
                                <span className="font-medium">${c.amount.toLocaleString()}</span>
                            </div>
                        ) : <p>No change orders for this project.</p>}
                    </div>
                );
            case 'inspections':
                 return (
                    <div className="space-y-3">
                        {project.inspections.length > 0 ? project.inspections.map(i => 
                            <div key={i.id} className="p-3 bg-slate-50 rounded-md border flex justify-between">
                                <span>{i.title}</span>
                                <span className="capitalize font-medium">{i.status}</span>
                            </div>
                        ) : <p>No inspections for this project.</p>}
                    </div>
                );
            case 'summary':
            default:
                return (
                    <div className="space-y-6">
                        <p className="text-slate-700">{project.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            <div className="bg-slate-50 p-4 rounded-lg border">
                                <h4 className="font-semibold text-slate-800 mb-2">Project Details</h4>
                                <p><strong>Location:</strong> {project.location}</p>
                                <p><strong>Status:</strong> <span className="capitalize font-medium">{project.status}</span></p>
                                <p><strong>Phase:</strong> {project.phase}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg border">
                                <h4 className="font-semibold text-slate-800 mb-2">Financial Summary</h4>
                                <p><strong>Budget:</strong> ${project.budget.toLocaleString()}</p>
                                <p><strong>Spent:</strong> ${project.actual_cost.toLocaleString()}</p>
                                <p className={`font-bold ${project.budget - project.actual_cost >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    <strong>Variance:</strong> ${(project.budget - project.actual_cost).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6">
            <button onClick={onBack} className="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                <i data-lucide="arrow-left" className="h-4 w-4 mr-2"></i>
                Back to All Projects
            </button>
            
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
                <div className="w-1/3">
                    <div className="flex justify-between mb-1 text-sm"><span className="font-medium text-slate-700">Progress</span><span className="font-medium text-slate-700">{project.progress}%</span></div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5"><div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${project.progress}%` }}></div></div>
                </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="border-b mb-6 pb-4 flex space-x-2">
                    <TabButton id="summary" label="Summary" count={3} />
                    <TabButton id="documents" label="Documents" count={project.documents.length} />
                    <TabButton id="bids" label="Bids" count={project.bids.length} />
                    <TabButton id="financials" label="Financials" count={project.change_orders.length} />
                    <TabButton id="inspections" label="Inspections" count={project.inspections.length} />
                </div>
                <div>{renderTabContent()}</div>
            </div>
        </div>
    );
}
