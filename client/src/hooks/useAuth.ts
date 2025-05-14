import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export type AuthUser = {
  id: number;
  username: string;
  type: string;
};

export function useAuth() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: user, isLoading } = useQuery<AuthUser>({
    queryKey: ["/api/users/me"],
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: (credentials: { username: string; password: string }) => {
      return apiRequest<{ message: string; user: AuthUser }>({
        url: "/api/users/login",
        method: "POST",
        data: credentials,
      });
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

  const registerMutation = useMutation({
    mutationFn: (userData: { username: string; password: string; type?: string }) => {
      return apiRequest<AuthUser>({
        url: "/api/users/register",
        method: "POST",
        data: userData,
      });
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

  const logoutMutation = useMutation({
    mutationFn: () => {
      return apiRequest<{ message: string }>({
        url: "/api/users/logout",
        method: "POST",
      });
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
    user,
    isLoading,
    isAuthenticated: !!user,
    isProfessor: user?.type === "professor",
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