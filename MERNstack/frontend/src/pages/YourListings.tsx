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
  const [listedTextbooks, setListedTextbooks] = useState<Textbook[]>([]);
  const [purchasedTextbooks, setPurchasedTextbooks] = useState<Textbook[]>([]);
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
      const [listed, purchased] = await Promise.all([
        textbookService.getMyTextbooks(user._id),
        textbookService.getMyPurchasedTextbooks(user._id)
      ]);
      setListedTextbooks(listed);
      setPurchasedTextbooks(purchased);
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
      setListedTextbooks(listedTextbooks.filter((t) => t._id !== textbookToDelete._id));
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
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              List Your First Textbook
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

      <AddTextbookDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={loadTextbooks}
      />
      <EditTextbookDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        textbook={selectedTextbook}
        onSuccess={loadTextbooks}
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
