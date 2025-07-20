import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Bienvenue sur votre application Closer !</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Commencez à gérer vos prospects et rapports ici.
        </p>
        <div className="space-y-4">
          <Button asChild size="lg">
            <Link to="/daily-report">Saisir un rapport quotidien</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link to="/reports">Voir mes rapports</Link>
          </Button>
          {/* Add more navigation buttons here as we build out features */}
        </div>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;