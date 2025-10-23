import { useState, useEffect } from "react";
import { textbookService, CreateTextbookData, Textbook } from "../lib/textbook-service";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { X } from "lucide-react";

interface EditTextbookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  textbook: Textbook | null;
}

export function EditTextbookDialog({
  open,
  onOpenChange,
  onSuccess,
  textbook,
}: EditTextbookDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateTextbookData>({
    title: "",
    author: "",
    isbn: "",
    price: 0,
    condition: "used",
    description: "",
    images: [],
  });
  const [imageUrl, setImageUrl] = useState("");

  // Pre-populate form when textbook changes
  useEffect(() => {
    if (textbook) {
      setFormData({
        title: textbook.title,
        author: textbook.author || "",
        isbn: textbook.isbn || "",
        price: textbook.price,
        condition: textbook.condition,
        description: textbook.description || "",
        images: textbook.images || [],
      });
    }
  }, [textbook]);

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      setFormData({ ...formData, images: [...(formData.images || []), imageUrl.trim()] });
      setImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images?.filter((_, i) => i !== index) || [],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!textbook) return;

    if (!formData.title || formData.price <= 0) {
      toast.error("Please fill in the required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      await textbookService.updateTextbook(textbook._id, formData);
      toast.success("Textbook updated successfully!");

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update textbook");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Textbook</DialogTitle>
          <DialogDescription>
            Update the details of your textbook listing.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-title" className="block text-sm font-medium mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g., Introduction to Psychology"
              required
            />
          </div>

          <div>
            <label htmlFor="edit-author" className="block text-sm font-medium mb-2">
              Author
            </label>
            <Input
              id="edit-author"
              value={formData.author}
              onChange={(e) =>
                setFormData({ ...formData, author: e.target.value })
              }
              placeholder="e.g., John Smith"
            />
          </div>

          <div>
            <label htmlFor="edit-isbn" className="block text-sm font-medium mb-2">
              ISBN
            </label>
            <Input
              id="edit-isbn"
              value={formData.isbn}
              onChange={(e) =>
                setFormData({ ...formData, isbn: e.target.value })
              }
              placeholder="e.g., 978-3-16-148410-0"
            />
          </div>

          <div>
            <label htmlFor="edit-price" className="block text-sm font-medium mb-2">
              Price ($) <span className="text-red-500">*</span>
            </label>
            <Input
              id="edit-price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price || ""}
              onChange={(e) =>
                setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
              }
              placeholder="e.g., 49.99"
              required
            />
          </div>

          <div>
            <label htmlFor="edit-condition" className="block text-sm font-medium mb-2">
              Condition <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.condition}
              onValueChange={(value: "new" | "like new" | "used" | "very used") =>
                setFormData({ ...formData, condition: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="like new">Like New</SelectItem>
                <SelectItem value="used">Used</SelectItem>
                <SelectItem value="very used">Very Used</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label
              htmlFor="edit-description"
              className="block text-sm font-medium mb-2"
            >
              Description
            </label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Add any additional details about the textbook..."
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Images (Optional)
            </label>
            <p className="text-xs text-muted-foreground mb-3">
              Paste an image URL and click "Add Image" to include photos
            </p>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Paste image URL (e.g., https://i.imgur.com/...)"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddImage();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAddImage}
                  disabled={!imageUrl.trim()}
                  className="whitespace-nowrap"
                >
                  Add Image
                </Button>
              </div>

              {formData.images && formData.images.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {formData.images.map((url, index) => (
                    <div
                      key={index}
                      className="relative group border rounded-lg overflow-hidden aspect-square"
                    >
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "";
                          e.currentTarget.alt = "Invalid image URL";
                          e.currentTarget.className = "w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-xs p-2";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Textbook"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
