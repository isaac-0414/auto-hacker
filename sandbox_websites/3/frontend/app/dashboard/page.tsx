"use client"

import React, { useEffect, useState } from 'react'

const Dashboard = () => {
    const [username, setUsername] = useState<string>("");

    useEffect(() => {
        const userName = sessionStorage.getItem('userName');
        setUsername(userName || "");
    })

    return (
        <div className='w-screen h-screen bg-white'>
            <div>Welcome, {username}</div>
            <div>Go Back to <a className="underline" href="/login">Log In</a></div>
        </div>
    )
}

export default Dashboard