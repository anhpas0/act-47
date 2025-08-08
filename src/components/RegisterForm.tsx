"use client";
import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setIsLoading(true);
        setIsSuccess(false);
        try {
            const res = await axios.post('/api/auth/register', { username, password });
            setMessage(res.data.message);
            setIsSuccess(true);
            if (res.data.redirect) {
                setTimeout(() => {
                    router.push(res.data.redirect);
                }, 2000);
            }
        } catch (err: any) {
            setMessage(err.response?.data?.error || 'Đăng ký thất bại.');
        } finally {
            setIsLoading(false);
        }
    };

    // ... (JSX của form giữ nguyên)
}