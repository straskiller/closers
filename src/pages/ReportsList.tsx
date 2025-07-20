import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';
import { showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale'; // Import French locale for date formatting

interface Report {
  id: string;
  closer_name: string;
  report_date: string;
  num_calls: number;
  num_nrp: number;
  num_settings: number;
  num_closings: number;
  num_sales: number;
  submission_timestamp: string;
}

const ReportsList = () => {
  const { session, loading } = useSession();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);

  useEffect(() => {
    if (!loading && !session) {
      navigate('/login');
      return;
    }

    if (session) {
      const fetchReports = async () => {
        setIsLoadingReports(true);
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .eq('user_id', session.user.id)
          .order('report_date', { ascending: false });

        if (error) {
          console.error('Error fetching reports:', error);
          showError('Erreur lors du chargement des rapports : ' + error.message);
        } else if (data) {
          setReports(data);
        }
        setIsLoadingReports(false);
      };
      fetchReports();
    }
  }, [session, loading, navigate]);

  if (loading || isLoadingReports) {
    return <div className="min-h-screen flex items-center justify-center">Chargement des rapports...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-4xl mt-8">
        <CardHeader>
          <CardTitle className="text-2xl">Mes Rapports Quotidiens</CardTitle>
          <CardDescription>Voici la liste de tous vos rapports soumis.</CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">Aucun rapport trouvé. Commencez par en soumettre un !</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Closer</TableHead>
                    <TableHead>Appels</TableHead>
                    <TableHead>NRP</TableHead>
                    <TableHead>Settings</TableHead>
                    <TableHead>Closings</TableHead>
                    <TableHead>Ventes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{format(new Date(report.report_date), 'PPP', { locale: fr })}</TableCell>
                      <TableCell>{report.closer_name}</TableCell>
                      <TableCell>{report.num_calls}</TableCell>
                      <TableCell>{report.num_nrp}</TableCell>
                      <TableCell>{report.num_settings}</TableCell>
                      <TableCell>{report.num_closings}</TableCell>
                      <TableCell>{report.num_sales}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsList;