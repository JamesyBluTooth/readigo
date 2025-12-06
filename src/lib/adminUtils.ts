import { supabase } from "@/integrations/supabase/client";

export type AppRole = 'admin' | 'moderator' | 'user';

export const checkUserRole = async (role: AppRole): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', role)
    .maybeSingle();

  if (error) {
    console.error('Error checking user role:', error);
    return false;
  }

  return !!data;
};

export const isAdmin = async (): Promise<boolean> => {
  return checkUserRole('admin');
};

export const useAdminStatus = () => {
  // This is a simple hook that checks admin status
  // For real-time updates, consider using a query with proper caching
  return {
    checkIsAdmin: isAdmin,
  };
};
