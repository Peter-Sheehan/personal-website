import './header.css';

export default function Header() {
    return (
    <header className="header">
            <h1 className="header-title">Peter.dev</h1>
            <nav className="header-nav">
                <a href="#about" className="header-link">About</a>
                <a href="#projects" className="header-link">Projects</a>
                <a href="#contact" className="header-link">Contact</a>
            </nav>
        </header>
    );
}