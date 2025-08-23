import { useState, useEffect } from 'react';
import { userService, User, UsersResponse, UserFilters } from '../services/userService';

export const useUsers = (filters?: UserFilters) => {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async (customFilters?: UserFilters) => {
    try {
      setLoading(true);
      setError(null);
      const result = await userService.getUsers(customFilters || filters);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchUsers
  };
};

export const useUser = (id: string) => {
  const [data, setData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await userService.getUserById(id);
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch user');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id]);

  return {
    data,
    loading,
    error
  };
};

export const useUserMutations = () => {
  const [loading, setLoading] = useState(false);

  const createUser = async (userData: Partial<User>) => {
    setLoading(true);
    try {
      const result = await userService.createUser(userData);
      return result;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: string, userData: Partial<User>) => {
    setLoading(true);
    try {
      const result = await userService.updateUser(id, userData);
      return result;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    setLoading(true);
    try {
      await userService.deleteUser(id);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createUser,
    updateUser,
    deleteUser,
    loading
  };
};
