const { useState, useEffect } = React;

/**
 * A generic, reusable component for handling CRUD (Create, Read, Update, Delete) operations.
 * @param {object} props - The component props.
 * @param {string} props.title - The title to display for the section (e.g., "Documents").
 * @param {string} props.endpoint - The API endpoint to fetch data from (e.g., "documents").
 * @param {Array<object>} props.fields - An array of objects defining the form fields.
 * @param {Array<object>} props.projects - The list of all projects, for the project selector dropdown.
 */
function CrudView({ title, endpoint, fields, projects }) {
    // useData is a custom hook defined in App.js that fetches data and handles loading/error states.
    const { data, loading, error, setData } = useData(endpoint);
    
    // State to control the visibility of the create/edit form.
    const [showForm, setShowForm] = useState(false);
    // State to hold the item currently being edited. Null if creating a new item.
    const [editingItem, setEditingItem] = useState(null);
    // State for the form's input data.
    const [formData, setFormData] = useState({});

    useEffect(() => {
        // Rerender Lucide icons whenever the view updates
        lucide.createIcons();
    }, [data]);

    // Function to open the form, either for creating or editing.
    const openForm = (item = null) => {
        // If an item is passed, we are editing. Pre-fill the form with its data.
        if (item) {
            setFormData(item);
            setEditingItem(item);
        } else {
            // Otherwise, we are creating. Reset the form to its initial state.
            const initialData = fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {});
            if (projects) initialData.project_id = '';
            setFormData(initialData);
            setEditingItem(null);
        }
        setShowForm(true);
    };

    // Handler for form submission.
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let response;
            if (editingItem) {
                // If editing, send a PUT request.
                response = await api.put(`${endpoint}/${editingItem.id}`, formData);
                // Update the item in the local state.
                setData(prev => prev.map(item => item.id === editingItem.id ? response.data : item));
            } else {
                // If creating, send a POST request.
                response = await api.post(endpoint, formData);
                // Add the new item to the local state.
                setData(prev => [response.data, ...prev]);
            }
            setShowForm(false); // Close the form on success.
        } catch (err) {
            console.error(`Failed to save ${title}:`, err);
            alert(`Error: Could not save the ${title.slice(0, -1)}.`);
        }
    };

    // Handler for deleting an item.
    const handleDelete = async (itemId) => {
        if (confirm('Are you sure you want to delete this item?')) {
            try {
                await api.delete(`${endpoint}/${itemId}`);
                // Remove the item from the local state.
                setData(prev => prev.filter(item => item.id !== itemId));
            } catch (err) {
                console.error(`Failed to delete ${title}:`, err);
                alert(`Error: Could not delete the ${title.slice(0, -1)}.`);
            }
        }
    };

    if (loading) return <p>Loading {title}...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                <button onClick={() => openForm()} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                    <i data-lucide="plus" className="h-5 w-5"></i>
                    <span>New {title.slice(0, -1)}</span>
                </button>
            </div>

            {/* --- Create/Edit Modal Form --- */}
            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow-md border">
                    <h2 className="text-xl font-semibold mb-4">{editingItem ? `Edit ${title.slice(0, -1)}` : `New ${title.slice(0, -1)}`}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {fields.map(field => (
                            <input
                                key={field.name}
                                type={field.type || 'text'}
                                placeholder={field.placeholder}
                                value={formData[field.name] || ''}
                                onChange={e => setFormData({...formData, [field.name]: e.target.value})}
                                className="w-full p-2 border rounded"
                                required
                            />
                        ))}
                        {projects && (
                            <select value={formData.project_id || ''} onChange={e => setFormData({...formData, project_id: e.target.value})} className="w-full p-2 border rounded" required>
                                <option value="">-- Select a Project --</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        )}
                        <div className="flex justify-end space-x-2">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
                        </div>
                    </form>
                </div>
            )}

            {/* --- List of Items --- */}
            <div className="space-y-4">
                {data.map(item => (
                    <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-slate-800">{item.title || item.name}</h3>
                            {item.status && <p className="text-sm text-gray-500">Status: <span className="font-medium capitalize">{item.status}</span></p>}
                            {item.amount != null && <p className="text-sm text-gray-500">Amount: <span className="font-medium">${item.amount.toLocaleString()}</span></p>}
                        </div>
                        <div className="space-x-4">
                            <button onClick={() => openForm(item)} className="text-sm font-medium text-blue-600 hover:text-blue-800">Edit</button>
                            <button onClick={() => handleDelete(item.id)} className="text-sm font-medium text-red-600 hover:text-red-800">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
            {data.length === 0 && <p className="text-center text-slate-500 py-8">No {title.toLowerCase()} found.</p>}
        </div>
    );
}
