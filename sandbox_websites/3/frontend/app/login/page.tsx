"use client"

import { useEffect, useState } from 'react'
import { useRouter } from "next/navigation";
import './style.css'

const SignIn = () => {
    const router = useRouter();

    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const [showUnauthorized, setShowUnauthorized] = useState<boolean>(false);
    const [showError, setShowError] = useState<boolean>(false);
    const [errorText, setErrorText] = useState<string>("");


    return (
        <div className="w-screen h-screen bg-white flex justify-center items-center">
            <div className="flex flex-col items-center">
                <div className="brand flex items-center">
                    <div className="logo mr-2">
                        <img className='w-[50px] h-[50px] rounded' src="/logo/logo-dark.svg" alt="" />
                    </div>
                    <div className="brand-name text-6xl font-medium">GENI</div>
                </div>
                <br></br>
                
                <div className="flex flex-col w-96">
                    <div className="input-box w-full relative">
                        <input 
                            className='w-full h-12 border-black border-2 rounded-full my-2 p-4' 
                            type="text" 
                            placeholder="Username" 
                            name="username"
                            onChange={(e: any) => setUsername(e.target.value)} 
                            value={username}
                            required 
                        />
                        <i className="fa-solid fa-user absolute top-6 right-5 text-lg"></i>
                    </div>
                    <div className="input-box w-full relative">
                        <input 
                            className='w-full h-12 border-black border-2 rounded-full my-2 p-4' 
                            type="password" 
                            placeholder="Password" 
                            name="password" 
                            onChange={(e: any) => setPassword(e.target.value)} 
                            value={password}
                            required 
                        />
                        <i className="fa-solid fa-lock absolute top-6 right-5 text-lg"></i>
                    </div>
                    <div className="flex flex-row justify-between">
                        <div className="form-check">
                            <input id="remember-me" className="form-check-input" type="checkbox" value="" />
                            <label className="form-check-label" htmlFor="remember-me"> Remember Me </label>
                        </div>
                        <a href="/forgot-password">Forgot Password?</a>
                    </div>
                    <button 
                        className='w-full h-12 bg-black text-white rounded-full my-2' 
                        type="submit"
                        onClick={async () => {
                            console.log({
                                'username': username,
                                'password': password
                            })
                            const response = await fetch("http://localhost:8080/login", {
                                method: "POST",
                                headers: {
                                   Accept: "application/json",
                                   "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    'username': username,
                                    'password': password
                                }),
                            });
                       
                            if (!response.ok) {
                                console.error(response.statusText);
                            }
                            const res = await response.json();
                            console.log(res)
                            if (res.unauthorized){
                                setShowUnauthorized(true);
                            } else if (res.error) {
                                setShowError(true);
                                setErrorText(res.error)
                            } else {
                                sessionStorage.setItem('userName', res.username);
                                router.push('/dashboard');
                            }
                        }}
                    >
                        Login
                    </button>
                    <p className='text-center'>Don't have an account? <a className="underline" href="/register">Register</a></p>
                    {showUnauthorized && 
                        <div className='bg-amber-400 mt-2 p-2 flex flex-row justify-between items-center'>
                            <p>Incorrect Username or Password.</p>
                            <i className="fa-solid fa-x hover:cursor-pointer" onClick={() => setShowUnauthorized(false)}></i>
                        </div>
                    }
                    {showError && 
                        <div className='bg-amber-400 mt-2 p-2 flex flex-row justify-between items-center'>
                            <p>{errorText}</p>
                            <i className="fa-solid fa-x hover:cursor-pointer" onClick={() => setShowError(false)}></i>
                        </div>
                    }
                </div>
                
            </div>
        </div>            
    )
}

export default SignIn;