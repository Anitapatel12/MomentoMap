import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Landing.css";

const images = ["/Slider1.jpg", "/Slider2.jpg", "/Slider3.jpg", "/background.jpg"];

const Landing = () => {
    const navigate = useNavigate();
    const [currentImage, setCurrentImage] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % images.length);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="landing-container">
            {/* Navigation Bar */}
            <nav className="navbar">
                <div className="logo">MomentoMap</div>

            </nav>

            {/* Main Content */}
            <div className="content-wrapper">
                <div className="text-section">
                    <h1>Welcome to <br /> <span className="highlight">MomentoMap</span></h1>
                    <p>
                        Capture, store, and relive your most cherished memories. <br />
                        A digital memory map that connects your past with the present. <br />
                        Organize & visualize your experiences like never before.
                    </p>
                    <button className="signin-btn" onClick={() => navigate("/signin")}>Sign In</button>
                </div>

                {/* Image Slider */}
                <div className="image-section">
                    <div className="slider-container">
                        {images.map((src, index) => (
                            <img key={index} src={src} alt={`Slider ${index}`} className={index === currentImage ? "active" : ""} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Landing;
