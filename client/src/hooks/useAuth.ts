import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export type AuthUser = {
  id: number;
  username: string;
  type: string;
};

type LoginResponse = {
  message: string;
  user: AuthUser;
};

export function useAuth() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch the current user
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/users/me"],
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      try {
        const res = await apiRequest({
          url: "/api/users/login",
          method: "POST",
          data: credentials,
        });
        return res as unknown as LoginResponse;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data) => {
      // Update auth state
      queryClient.setQueryData(["/api/users/me"], data.user);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: { username: string; password: string; type?: string }) => {
      try {
        const res = await apiRequest({
          url: "/api/users/register",
          method: "POST",
          data: userData,
        });
        return res as unknown as AuthUser;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Registration successful",
        description: "You can now login with your credentials",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        const res = await apiRequest({
          url: "/api/users/logout",
          method: "POST",
        });
        return res as unknown as { message: string };
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      // Clear auth state
      queryClient.setQueryData(["/api/users/me"], null);
      // Invalidate user-related queries
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    },
  });

  return {
    user: user as AuthUser | undefined,
    isLoading,
    isAuthenticated: !!user,
    isProfessor: user && (user as AuthUser).type === "professor",
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    loginStatus: {
      isPending: loginMutation.isPending,
      isError: loginMutation.isError,
      error: loginMutation.error,
    },
    registerStatus: {
      isPending: registerMutation.isPending,
      isError: registerMutation.isError,
      error: registerMutation.error,
    },
    logoutStatus: {
      isPending: logoutMutation.isPending,
    },
  };
}