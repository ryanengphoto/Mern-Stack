import { useState, useEffect } from "react";
import { useAuth } from "../lib/auth-context";
import { textbookService, Textbook } from "../lib/textbook-service";
import { Button } from "../components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function YourListings() {
  const { user } = useAuth();
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTextbooks();
  }, []);

  const loadTextbooks = async () => {
    if (!user?._id) return; // Don't load if not logged in
    try {
      setIsLoading(true);
      const data = await textbookService.getMyTextbooks(user._id);
      setTextbooks(data);
    } catch (error) {
      toast.error("Failed to load your textbooks");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this textbook?")) return;

    try {
      await textbookService.deleteTextbook(id);
      setTextbooks(textbooks.filter((t) => t._id !== id));
      toast.success("Textbook deleted successfully");
    } catch (error) {
      toast.error("Failed to delete textbook");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading your listings...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Listings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your textbook listings
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Textbook
        </Button>
      </div>

      {textbooks.length === 0 ? (
        <div className="text-center py-12 bg-muted rounded-lg">
          <p className="text-muted-foreground mb-4">
            You haven't listed any textbooks yet
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            List Your First Textbook
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {textbooks.map((textbook) => (
            <div key={textbook._id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{textbook.title}</h3>
                  {textbook.author && (
                    <p className="text-muted-foreground">{textbook.author}</p>
                  )}
                  <p className="text-lg font-bold mt-2">${textbook.price}</p>
                  <p className="text-sm text-muted-foreground">
                    Condition: {textbook.condition}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(textbook._id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
