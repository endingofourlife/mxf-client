import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { debounce } from 'lodash'; // Предполагаем, что lodash установлен; если нет, можно реализовать debounce вручную
import api from "../api/BaseApi.ts";

interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    is_superuser: boolean;
    created_at: string;
}

interface RealEstateObject {
    id: string;
    title?: string;
    // Add other fields as needed
}

interface PermissionRequest {
    user_id: string;
    real_estate_object_id: string;
}

function AdminPage() {
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [realEstateObjects, setRealEstateObjects] = useState<RealEstateObject[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedObjects, setSelectedObjects] = useState<Set<string>>(new Set());
    const [targetUserId, setTargetUserId] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Загружаем всех пользователей один раз при монтировании
    useEffect(() => {
        async function fetchAllUsers() {
            try {
                setSearchLoading(true);
                const { data } = await api.get<User[]>('/user/all-users');
                setAllUsers(data);
                setFilteredUsers(data); // Изначально показываем всех, но по логике запроса — фильтруем только по поиску
            } catch (error) {
                console.error('Failed to fetch users:', error);
                setError('Failed to fetch users');
            } finally {
                setSearchLoading(false);
            }
        }
        fetchAllUsers();
    }, []);

    // Оптимизированная фильтрация с useMemo (реагирует только на изменения searchQuery)
    const filteredUsersMemo = useMemo(() => {
        if (!searchQuery.trim()) {
            return []; // Изначально ничего не показываем
        }
        const query = searchQuery.toLowerCase().trim();
        return allUsers.filter(user =>
            user.first_name.toLowerCase().includes(query) ||
            user.last_name.toLowerCase().includes(query)
        );
    }, [allUsers, searchQuery]);

    // Debounced обновление filteredUsers (для производительности, если allUsers большой)
    useEffect(() => {
        setFilteredUsers(filteredUsersMemo);
    }, [filteredUsersMemo]);

    // Debounced обработчик поиска (избегает фильтрации на каждый keystroke)
    const debouncedSearch = useCallback(
        debounce((query: string) => {
            setSearchQuery(query);
        }, 300), // 300ms задержка
        []
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        debouncedSearch(query);
    };

    // Остальной код для модалки и объектов остается без изменений
    const fetchRealEstateObjects = async (userId: string) => {
        try {
            setLoading(true);
            setError(null);
            const { data } = await api.get<RealEstateObject[]>(`/real-estate/user/${userId}`);
            setRealEstateObjects(data);
            setSelectedObjects(new Set());
        } catch (error) {
            console.error('Failed to fetch real estate objects:', error);
            setError('Failed to fetch real estate objects');
        } finally {
            setLoading(false);
        }
    };

    const handleViewObjects = async (user: User) => {
        setSelectedUser(user);
        await fetchRealEstateObjects(user.id);
        setIsModalOpen(true);
    };

    const handleObjectToggle = (objectId: string) => {
        const newSelected = new Set(selectedObjects);
        if (newSelected.has(objectId)) {
            newSelected.delete(objectId);
        } else {
            newSelected.add(objectId);
        }
        setSelectedObjects(newSelected);
    };

    const handleAssignObjects = async () => {
        if (!targetUserId || selectedObjects.size === 0) {
            setError('Please select a target user and at least one object');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const promises = Array.from(selectedObjects).map(async (objectId) => {
                const requestBody: PermissionRequest = {
                    user_id: targetUserId,
                    real_estate_object_id: objectId,
                };
                await api.post('/api/v1/user/admin/permissions', requestBody);
            });

            await Promise.all(promises);

            if (selectedUser) {
                await fetchRealEstateObjects(selectedUser.id);
            }

            setSelectedObjects(new Set());
            setTargetUserId('');
            setError('Objects assigned successfully');
        } catch (error) {
            console.error('Failed to assign objects:', error);
            setError('Failed to assign objects');
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
        setRealEstateObjects([]);
        setSelectedObjects(new Set());
        setTargetUserId('');
        setError(null);
    };

    return (
        <main>
            <h1>Admin panel</h1>
            <section>
                <h2>Search Users</h2>
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="userSearch" style={{ display: 'block', marginBottom: '5px' }}>
                        Search by First Name or Last Name:
                    </label>
                    <input
                        id="userSearch"
                        type="text"
                        placeholder="Enter name or surname..."
                        onChange={handleSearchChange}
                        style={{ padding: '8px', width: '300px', fontSize: '16px' }}
                        aria-label="Search users by name"
                        disabled={searchLoading}
                    />
                    {searchLoading && <p style={{ color: 'blue', marginTop: '5px' }}>Loading users...</p>}
                </div>

                {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}

                {filteredUsers.length > 0 ? (
                    <>
                        <h3>Found {filteredUsers.length} user(s):</h3>
                        <table>
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Email</th>
                                <th>Is Superuser</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.first_name}</td>
                                    <td>{user.last_name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.is_superuser ? 'Yes' : 'No'}</td>
                                    <td>{new Date(user.created_at).toLocaleString()}</td>
                                    <td>
                                        <button onClick={() => handleViewObjects(user)}>
                                            Переглянути Real Estate Objects
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </>
                ) : (
                    searchQuery.trim() && !searchLoading && (
                        <p style={{ color: 'gray', fontStyle: 'italic' }}>No users found matching "{searchQuery}".</p>
                    )
                )}
            </section>

            {/* Модалка остается той же */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: '20%', left: '20%', width: '60%', height: '60%', background: 'white', border: '1px solid #ccc', zIndex: 1000, overflow: 'auto' }}>
                    <div style={{ padding: '20px' }}>
                        <h2>Real Estate Objects for {selectedUser?.first_name} {selectedUser?.last_name}</h2>
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                        {loading && <p>Loading...</p>}
                        <table>
                            <thead>
                            <tr>
                                <th>Select</th>
                                <th>ID</th>
                                <th>Title</th>
                            </tr>
                            </thead>
                            <tbody>
                            {realEstateObjects.map(object => (
                                <tr key={object.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedObjects.has(object.id)}
                                            onChange={() => handleObjectToggle(object.id)}
                                        />
                                    </td>
                                    <td>{object.id}</td>
                                    <td>{object.title || 'N/A'}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        <div style={{ marginTop: '20px' }}>
                            <label>
                                Assign to user ID:
                                <input
                                    type="text"
                                    value={targetUserId}
                                    onChange={(e) => setTargetUserId(e.target.value)}
                                    placeholder="Enter target user ID"
                                />
                            </label>
                            <button onClick={handleAssignObjects} disabled={loading || selectedObjects.size === 0}>
                                Assign Selected Objects
                            </button>
                            <button onClick={closeModal} style={{ marginLeft: '10px' }}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default AdminPage;