import React from "react";
import { SignIn } from "@clerk/clerk-react";
import "./SignIn.css";

const SignInPage = () => {
    return (
        <div className="signin-container">
            <div className="signin-card">
                <div className="header-image"></div>
                <h2 >Welcome to our platform!,</h2>
                <p>Where your memories, beautifully mapped.</p>

                <SignIn path="/signin" routing="path" />
            </div>
        </div>
    );
};

export default SignInPage;
