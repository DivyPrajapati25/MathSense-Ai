import logo from "../../../assets/image.png";

const Logo = () => (
    <div className="flex items-center space-x-3">
        <img
            src={logo}
            alt="MathSense AI Logo"
            className="w-10 h-10 object-contain"
        />
        <div>
            <h1 className="text-xl font-bold text-blue-600 leading-tight">
                MathSense AI
            </h1>
            <p className="text-xs text-gray-500 leading-tight">AI-Powered Grading</p>
        </div>
    </div>
);

export default Logo;