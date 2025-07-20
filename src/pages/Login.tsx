import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Connectez-vous</CardTitle>
          <CardDescription>Accédez à votre tableau de bord de closer.</CardDescription>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            providers={[]} // No third-party providers for now, as per request
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))',
                    brandAccent: 'hsl(var(--primary-foreground))',
                  },
                },
              },
            }}
            theme="light" // Use light theme
            redirectTo={window.location.origin} // Redirect to home after login
          />
        </CardContent>
      </Card>
    </div>
  );
  };

export default Login;