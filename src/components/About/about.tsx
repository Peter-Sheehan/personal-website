import './about.css';

export default function About() {
    return (
        <section id="about" className="about">
            <div className="about-content">
                <div className="about-header">
                    <h2 className="about-title">Hi I`m</h2>
                    <h2 className="about-name">Peter Sheehan</h2>
                </div>
                <div className="about-job-container">
                    <h3 className="about-job">And I`m a </h3>
                    <h3 className="about-job-name">Junior Frontend developer</h3>
                </div>
            </div>
            <div className="about-photo-wrapper">
                <img src="/image0 (1).jpeg" alt="Peter Sheehan" className="about-photo" />
            </div>
        </section>
    );
}
