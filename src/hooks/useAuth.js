import { useEffect, useState } from 'react';

const useAuth = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) setUser(JSON.parse(stored));
    }, []);

    return user;
};

export default useAuth;
