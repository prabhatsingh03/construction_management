const { useEffect } = React;

/**
 * Renders the main navigation sidebar for the application.
 * @param {object} props - The component props.
 * @param {string} props.activeSection - The ID of the currently active section.
 * @param {Function} props.onSectionChange - Callback function to change the active section.
 * @param {Function} props.onLogout - Callback function to handle user logout.
 */
function Sidebar({ activeSection, onSectionChange, onLogout }) {
    // The list of navigation items to be displayed in the sidebar.
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'home' },
        { id: 'projects', label: 'Projects', icon: 'folder-open' },
        { id: 'documents', label: 'Documents', icon: 'file-text' },
        { id: 'preconstruction', label: 'Preconstruction', icon: 'hammer' },
        { id: 'financials', label: 'Financials', icon: 'dollar-sign' },
        { id: 'quality-safety', label: 'Quality & Safety', icon: 'shield' },
    ];
    
    // This effect ensures that the Lucide icons are rendered correctly
    // whenever the active section changes or the component mounts.
    useEffect(() => {
        lucide.createIcons();
    }, [activeSection]);

    return (
        <div className="w-64 bg-slate-900 h-screen flex flex-col p-4 justify-between">
            <div>
                <div className="flex items-center space-x-3 p-4 mb-5">
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <i data-lucide="hammer" className="h-6 w-6 text-white"></i>
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-lg">BuildPro</h1>
                        <p className="text-slate-400 text-sm">Platform</p>
                    </div>
                </div>
                <ul className="space-y-2">
                    {navItems.map((item) => (
                        <li key={item.id}>
                            <button
                                onClick={() => onSectionChange(item.id)}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                                    activeSection === item.id
                                        ? 'bg-blue-600 text-white' // Active state
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white' // Inactive state
                                }`}
                            >
                                <i data-lucide={item.icon} className="h-5 w-5"></i>
                                <span className="font-medium">{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            <button 
                onClick={onLogout} 
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition-colors"
            >
                <i data-lucide="log-out" className="h-5 w-5"></i>
                <span className="font-medium">Logout</span>
            </button>
        </div>
    );
}
