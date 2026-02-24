import { Component } from "react";

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-green-50">
                    <div className="text-center px-6">
                        <h1 className="text-6xl font-bold text-red-500 mb-4">Oops!</h1>
                        <p className="text-xl text-gray-600 mb-6">Something went wrong.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center justify-center h-10 px-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
