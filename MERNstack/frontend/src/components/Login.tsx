import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login()
{
    const navigate = useNavigate();
    const [message,setMessage] = useState('');
    const [email,setEmail] = useState('');
    const [loginPassword,setPassword] = useState('');


    function handleSetEmail(e: React.ChangeEvent<HTMLInputElement>): void {
        setEmail(e.target.value);
    }

    function handleSetPassword( e: any ) : void
    {
        setPassword( e.target.value );
    }

    async function doLogin(event: any): Promise<void> {
    event.preventDefault();
    setMessage('');

    const body = JSON.stringify({
        email: email.trim(),
        password: loginPassword
    });

    try {
        const response = await fetch('https://lamp-stack4331.xyz/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
        });

        const res = await response.json();

        if (!response.ok) {
        // Special case: email not verified
        if (response.status === 403 && res.needsVerification) {
            setMessage('Please verify your email. Check your inbox or spam folder.');
        } else {
            setMessage(res.error || 'Login failed');
        }
        return;
        }

        // Success: backend returns { token, user }
        const { token, user } = res;

        const userData = {
        token,
        user,
        };

        localStorage.setItem('user_data', JSON.stringify(userData));
        setMessage('');
        window.location.href = '/textbooks';
    } catch (error: any) {
        alert(error.toString());
        return;
    }
    }

        catch(error:any)
        {
            alert(error.toString());
            return;
        }
    };

    return (
        <div id="loginDiv">
            <span id="inner-title">PLEASE LOG IN</span><br />
            <input
                type="email"
                id="loginEmail"
                placeholder="Email"
                onChange={handleSetEmail}
            />

            <input type="password" id="loginPassword" placeholder="Password" onChange={handleSetPassword} /> <br />
            <input type="submit" id="loginButton" className="buttons" value = "Login" onClick={doLogin} />
            <span id="loginResult">{message}</span>
        </div>
    );
}

export default Login;