import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { MapNote } from "@/components/ui/map";

interface EditNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: MapNote | null;
  onSave: (updatedNote: MapNote) => void;
  onDelete: (noteId: string) => void;
}

const noteIcons = [
  { value: "fa-map-marker-alt", label: "موقع عام", icon: "fa-map-marker-alt" },
  { value: "fa-exclamation-triangle", label: "تحذير", icon: "fa-exclamation-triangle" },
  { value: "fa-info-circle", label: "معلومات", icon: "fa-info-circle" },
  { value: "fa-tools", label: "صيانة", icon: "fa-tools" },
  { value: "fa-car", label: "مواقف", icon: "fa-car" },
  { value: "fa-building", label: "مبنى", icon: "fa-building" },
  { value: "fa-home", label: "منزل", icon: "fa-home" },
  { value: "fa-store", label: "متجر", icon: "fa-store" }
];

export function EditNoteModal({ open, onOpenChange, note, onSave, onDelete }: EditNoteModalProps) {
  const [noteTitle, setNoteTitle] = useState("");
  const [noteText, setNoteText] = useState("");
  const [assignedTo, setAssignedTo] = useState("all");
  const [selectedIcon, setSelectedIcon] = useState("fa-map-marker-alt");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  // Update form when note changes
  useEffect(() => {
    if (note) {
      setNoteTitle(note.title || "");
      setNoteText(note.note);
      setAssignedTo(note.assignedTo || "all");
      setSelectedIcon(note.icon);
      setLatitude(note.latitude.toString());
      setLongitude(note.longitude.toString());
    }
  }, [note]);

  const handleSave = () => {
    if (!note || !noteTitle.trim() || !noteText.trim()) return;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      alert("يرجى إدخال إحداثيات صحيحة");
      return;
    }

    const updatedNote: MapNote = {
      ...note,
      title: noteTitle.trim(),
      note: noteText.trim(),
      assignedTo: assignedTo,
      icon: selectedIcon,
      latitude: lat,
      longitude: lng
    };

    onSave(updatedNote);
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!note) return;
    
    if (confirm("هل أنت متأكد من حذف هذه الملاحظة؟")) {
      onDelete(note.id);
      onOpenChange(false);
    }
  };

  if (!note) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">تحرير الملاحظة</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Note Title */}
          <div>
            <label className="text-sm font-medium mb-2 block">عنوان الملاحظة</label>
            <Input
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="أدخل عنوان الملاحظة..."
            />
          </div>

          {/* Note Text */}
          <div>
            <label className="text-sm font-medium mb-2 block">نص الملاحظة</label>
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="اكتب ملاحظتك هنا..."
              className="min-h-[80px]"
            />
          </div>

          {/* Assignment */}
          <div>
            <label className="text-sm font-medium mb-2 block">إسناد الملاحظة إلى</label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الموظفين في المنطقة</SelectItem>
                <SelectItem value="neighborhood">موظفين الحي المحيط</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Icon Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">نوع الملاحظة</label>
            <Select value={selectedIcon} onValueChange={setSelectedIcon}>
              <SelectTrigger>
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <i className={`fas ${selectedIcon} text-blue-500`}></i>
                    <span>{noteIcons.find(icon => icon.value === selectedIcon)?.label}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {noteIcons.map((icon) => (
                  <SelectItem key={icon.value} value={icon.value}>
                    <div className="flex items-center gap-2">
                      <i className={`fas ${icon.icon} text-blue-500`}></i>
                      <span>{icon.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location Coordinates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-2 block">خط العرض</label>
              <Input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="24.7136"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">خط الطول</label>
              <Input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="46.6753"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={!noteTitle.trim() || !noteText.trim()}
            >
              حفظ التغييرات
            </Button>
            <Button
              onClick={handleDelete}
              variant="destructive"
              className="flex-1"
            >
              حذف الملاحظة
            </Button>
          </div>

          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="w-full"
          >
            إلغاء
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}