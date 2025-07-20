import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';

const formSchema = z.object({
  closer_name: z.string().min(2, { message: 'Le nom du closer est requis.' }),
  report_date: z.date({ required_error: 'La date du rapport est requise.' }),
  num_calls: z.coerce.number().min(0, { message: 'Doit être un nombre positif.' }),
  num_nrp: z.coerce.number().min(0, { message: 'Doit être un nombre positif.' }),
  num_settings: z.coerce.number().min(0, { message: 'Doit être un nombre positif.' }),
  num_closings: z.coerce.number().min(0, { message: 'Doit être un nombre positif.' }),
  num_sales: z.coerce.number().min(0, { message: 'Doit être un nombre positif.' }),
});

const DailyReport = () => {
  const { session, loading } = useSession();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      closer_name: '',
      report_date: new Date(),
      num_calls: 0,
      num_nrp: 0,
      num_settings: 0,
      num_closings: 0,
      num_sales: 0,
    },
  });

  useEffect(() => {
    if (!loading && !session) {
      navigate('/login');
    } else if (session) {
      const fetchUserName = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          showError('Erreur lors du chargement du profil utilisateur.');
        } else if (data) {
          const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim();
          setUserName(fullName);
          form.setValue('closer_name', fullName);
        }
      };
      fetchUserName();
    }
  }, [session, loading, navigate, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!session) {
      showError('Vous devez être connecté pour soumettre un rapport.');
      navigate('/login');
      return;
    }

    const { data, error } = await supabase.from('reports').insert({
      user_id: session.user.id,
      closer_name: values.closer_name,
      report_date: format(values.report_date, 'yyyy-MM-dd'),
      num_calls: values.num_calls,
      num_nrp: values.num_nrp,
      num_settings: values.num_settings,
      num_closings: values.num_closings,
      num_sales: values.num_sales,
    });

    if (error) {
      console.error('Error submitting report:', error);
      showError('Erreur lors de la soumission du rapport : ' + error.message);
    } else {
      showSuccess('Rapport soumis avec succès !');
      form.reset({
        closer_name: userName, // Keep closer name pre-filled
        report_date: new Date(),
        num_calls: 0,
        num_nrp: 0,
        num_settings: 0,
        num_closings: 0,
        num_sales: 0,
      });
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Rapport Quotidien du Closer</CardTitle>
          <CardDescription>Saisissez vos performances pour la journée.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="closer_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du Closer</FormLabel>
                    <FormControl>
                      <Input placeholder="Votre nom" {...field} disabled={!!userName} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="report_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-[240px] pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Choisissez une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date('1900-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="num_calls"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre d'appels</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="num_nrp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de NRP</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="num_settings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de Settings</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="num_closings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de Closings</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="num_sales"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de Ventes</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Soumettre le rapport
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyReport;