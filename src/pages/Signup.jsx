import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import Header from "../components/Header";
import {API_URL} from "../config.js";

const Signup = () => {
    const [form, setForm] = useState({name: '', email: '', password: ''});
    const navigate = useNavigate();

    const handleChange = e => {
        setForm({...form, [e.target.name]: e.target.value});
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/signup`, form);
            alert("Signup successful!");
            navigate('/');
        } catch (error) {
            alert("Signup failed: " + error.response?.data?.message || error.message);
        }
    };

    return (<>
            <Header/>
            <div className="container mt-5" style={{maxWidth: 400}}>
                <h2 className="mb-4">Sign Up</h2>
                <form onSubmit={handleSignup}>
                    <div className="mb-3">
                        <label className="form-label">Name</label>
                        <input type="text" className="form-control" name="name"
                               value={form.name} onChange={handleChange} required/>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input type="email" className="form-control" name="email"
                               value={form.email} onChange={handleChange} required/>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input type="password" className="form-control" name="password"
                               value={form.password} onChange={handleChange} required/>
                    </div>
                    <button type="submit" className="btn btn-success w-100">Sign Up</button>
                </form>
            </div>
        </>);
};

export default Signup;
