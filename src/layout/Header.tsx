import {useAuth} from "../contexts/AuthContext.tsx";
import {Link} from "react-router-dom";

function Header() {
    const {user, logout} = useAuth();

    if (!user) return null;

    return (
        <header>
            <nav>
                <Link to="/">Home</Link>
                {user?.is_superuser && (
                    <Link to="/admin">Admin Panel</Link>
                )}
                <button onClick={logout}>Logout</button>
            </nav>
        </header>
    );
}

export default Header;
