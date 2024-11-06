import React, { useEffect, useState } from "react";
import { fetchUsers, deleteUser } from "../features/usersSlice";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { User } from "../types/auth";

export const Users: React.FC = () => {
    const dispatch = useAppDispatch();
    const { users, status, error } = useAppSelector((state) => state.users);
    const token = useAppSelector((state) => state.auth);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (token) {
            void dispatch(fetchUsers());
        }
    }, [dispatch, token]);

    useEffect(() => {
        if (error) {
            alert(error);
        }
    }, [error, dispatch]);

    const handleDeleteUser = async (id: number) => {
setIsLoading(true);
try {
    await dispatch(deleteUser(id)).unwrap();
} finally {
    setIsLoading(false);
}
    };

    if (status === "loading") {
        return <div>Loading...</div>;
    }

    return (
        <div>
            {users.map((user: any) => (
                <div key={user.id}>
                    <h3>{user.email}</h3>
                    <button disabled={isLoading} onClick={() => 
                        handleDeleteUser(user.id)}>Delete</button>
                </div>
            ))}
        </div>
    );
};

export default Users;