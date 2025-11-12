import { useState, useEffect } from "react";
import { useAuth } from "../lib/auth-context";
import { textbookService, Textbook } from "../lib/textbook-service";
import { Button } from "../components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { AddTextbookDialog } from "../components/AddTextbookDialog";
import { EditTextbookDialog } from "../components/EditTextbookDialog";
import { DeleteConfirmDialog } from "../components/DeleteConfirmDialog";

export function YourListings() {
  const { user } = useAuth();
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTextbook, setSelectedTextbook] = useState<Textbook | null>(null);
  const [textbookToDelete, setTextbookToDelete] = useState<Textbook | null>(null);

  useEffect(() => {
    loadTextbooks();
  }, []);

  const loadTextbooks = async () => {
    if (!user?._id) return;
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

  const handleDeleteClick = (textbook: Textbook) => {
    setTextbookToDelete(textbook);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!textbookToDelete) return;
    try {
      await textbookService.deleteTextbook(textbookToDelete._id);
      setTextbooks(textbooks.filter((t) => t._id !== textbookToDelete._id));
      toast.success("Textbook deleted successfully");
    } catch (error) {
      toast.error("Failed to delete textbook");
    } finally {
      setTextbookToDelete(null);
    }
  };

  const handleEdit = (textbook: Textbook) => {
    setSelectedTextbook(textbook);
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading your listings...</p>
      </div>
    );
  }

  const activeTextbooks = textbooks.filter((t) => !t.buyer);
  const soldTextbooks = textbooks.filter((t) => t.buyer);

  return (
    <div className="container mx-auto px-4 py-8 space-y-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Listings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your textbook listings
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Textbook
        </Button>
      </div>

      {/* Active Listings */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Active Listings</h2>
        {activeTextbooks.length === 0 ? (
          <div className="text-center py-12 bg-muted rounded-lg">
            <p className="text-muted-foreground mb-4">
              You have no active listings
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              List Your First Textbook
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activeTextbooks.map((textbook) => (
              <div
                key={textbook._id}
                className="border rounded-lg overflow-hidden transition-shadow hover:shadow-lg relative"
              >
                <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                  {textbook.images && textbook.images.length > 0 ? (
                    <img
                      src={textbook.images[0]}
                      alt={textbook.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No Image
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-semibold line-clamp-2">{textbook.title}</h3>
                  {textbook.author && (
                    <p className="text-sm text-muted-foreground">{textbook.author}</p>
                  )}
                  <p className="text-lg font-bold">${textbook.price.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">
                    Condition: {textbook.condition}
                  </p>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(textbook)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDeleteClick(textbook)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Sold Listings */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold mb-4">Sold Listings</h2>
        {soldTextbooks.length === 0 ? (
          <div className="text-center py-12 bg-muted rounded-lg">
            <p className="text-muted-foreground">
              You haven't sold any textbooks yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {soldTextbooks.map((textbook) => (
              <div
                key={textbook._id}
                className="border rounded-lg overflow-hidden relative opacity-50 grayscale"
              >
                <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 text-xs font-bold rounded">
                  SOLD
                </div>

                <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                  {textbook.images && textbook.images.length > 0 ? (
                    <img
                      src={textbook.images[0]}
                      alt={textbook.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No Image
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-semibold line-clamp-2">{textbook.title}</h3>
                  {textbook.author && (
                    <p className="text-sm text-muted-foreground">{textbook.author}</p>
                  )}
                  <p className="text-lg font-bold">${textbook.price.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">
                    Condition: {textbook.condition}
                  </p>
                  <p className="text-xs text-muted-foreground italic">
                    Purchased by another user
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <AddTextbookDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={loadTextbooks}
      />
      <EditTextbookDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={loadTextbooks}
        textbook={selectedTextbook}
      />
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Textbook"
        itemName={textbookToDelete?.title}
        description="This action cannot be undone."
      />
    </div>
  );
}
