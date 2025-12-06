import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAdmin } from "@/lib/adminUtils";
import { BookCorrectionReview } from "@/components/admin/BookCorrectionReview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BookOpen, Loader2, Shield, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

const Admin = () => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const adminStatus = await isAdmin();
      setIsAuthorized(adminStatus);
      
      if (!adminStatus) {
        navigate('/');
      }
    };

    checkAdmin();
  }, [navigate]);

  const { data: pendingCount } = useQuery({
    queryKey: ['pending-corrections-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('book_correction_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (error) throw error;
      return count || 0;
    },
    enabled: isAuthorized === true,
  });

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8 px-4">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
        </div>

        <Tabs defaultValue="corrections" className="space-y-6">
          <TabsList>
            <TabsTrigger value="corrections" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Book Corrections
              {pendingCount !== undefined && pendingCount > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="corrections">
            <Card>
              <CardHeader>
                <CardTitle>Pending Book Corrections</CardTitle>
                <CardDescription>
                  Review and approve user-submitted corrections to book metadata.
                  Approved changes will be saved to the canonical books database.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BookCorrectionReview />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage user roles and permissions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  User management features coming soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
