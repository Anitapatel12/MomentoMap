import React, { useEffect } from "react";
import { useSignIn } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { SignIn } from "@clerk/clerk-react";
import "./SignIn.css";

const SignInPage = () => {
    const { isSignedIn } = useSignIn();
    const navigate = useNavigate();

    // 🔥 Redirect manually after sign-in
    useEffect(() => {
        if (isSignedIn) {
            navigate("/dashboard");
        }
    }, [isSignedIn, navigate]);

    return (
        <div className="signin-container">
            <div className="signin-card">
                <div className="header-image"></div>
                <h2>Welcome to our platform!</h2>
                <p>Where your memories, beautifully mapped.</p>

                {/* No need for afterSignInUrl now */}
                <SignIn path="/signin" routing="path" />
            </div>
        </div>
    );
};

export default SignInPage;
