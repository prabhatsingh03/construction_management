const { useState, useEffect } = React;

/**
 * A component that renders a form for user login and registration.
 * @param {object} props - The component props.
 * @param {Function} props.onLogin - A callback function to be executed on successful login.
 */
function LoginForm({ onLogin }) {
    // State to toggle between login and sign-up forms
    const [isSignUp, setIsSignUp] = useState(false);
    
    // State for form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    
    // State for handling UI feedback
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Render Lucide icons when the component mounts
        lucide.createIcons();
    }, []);

    // Handles the form submission for both login and registration
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Define the endpoint relative to the base URL in App.js
        const endpoint = isSignUp 
            ? `register` 
            : `login`;
            
        const payload = isSignUp 
            ? { email, password, full_name: fullName } 
            : { email, password };

        try {
            // Use the global 'api' instance from App.js for the request
            const response = await api.post(endpoint, payload);
            
            if (isSignUp) {
                // After successful registration, prompt the user to log in
                alert('Registration successful! Please log in.');
                setIsSignUp(false);
                setPassword(''); // Clear password field
            } else {
                // On successful login, store the token and call the onLogin callback
                localStorage.setItem('authToken', response.data.access_token);
                onLogin();
            }
        } catch (err) {
            // Display any errors from the backend
            setError(err.response?.data?.error || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full space-y-8 p-10 bg-white shadow-xl rounded-2xl">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-blue-600 p-3 rounded-xl">
                            <i data-lucide="hammer" className="h-8 w-8 text-white"></i>
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900">BuildPro Platform</h2>
                    <p className="mt-2 text-slate-600">
                        {isSignUp ? 'Create your construction management account' : 'Sign in to your account'}
                    </p>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {isSignUp && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Full Name</label>
                            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg" required />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Email Address</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg" required />
                    </div>
                    
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 transition-colors">
                        {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
                    </button>
                </form>
                <div className="text-center">
                    <button onClick={() => { setIsSignUp(!isSignUp); setError(''); }} className="font-medium text-blue-600 hover:text-blue-500">
                        {isSignUp ? 'Already have an account? Sign In' : "Need an account? Sign Up"}
                    </button>
                </div>
            </div>
        </div>
    );
}
