import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import type { Employee } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EditNoteModal } from "@/components/edit-note-modal";

// Fix Leaflet default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapNote {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  note: string;
  icon: string;
  assignedTo: string; // "all" or employee ID
  createdAt: Date;
}

interface MapProps {
  employees: Employee[];
  selectedEmployee: Employee | null;
  onEmployeeSelect: (employee: Employee) => void;
  className?: string;
  onMapMove?: (lat: number, lng: number, zoom: number) => void;
  onNotesChange?: (notes: MapNote[]) => void;
}

export type { MapNote };

export function Map(props: MapProps) {
  const { employees = [], selectedEmployee, onEmployeeSelect, className, onNotesChange } = props;
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: number]: L.Marker }>({});
  const noteMarkersRef = useRef<{ [key: string]: L.Marker }>({});
  const [notes, setNotes] = useState<MapNote[]>([]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingNote, setEditingNote] = useState<MapNote | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [tempMarker, setTempMarker] = useState<L.Marker | null>(null);

  const [noteText, setNoteText] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [assignedTo, setAssignedTo] = useState("all"); // "all" or employee ID
  const [selectedIcon, setSelectedIcon] = useState("fa-sticky-note");
  const [isPlacingNote, setIsPlacingNote] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map centered on Riyadh
    const map = L.map(mapRef.current).setView([24.7136, 46.6753], 11);

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Add right-click context menu for adding notes
    map.on('contextmenu', (e) => {
      e.originalEvent.preventDefault(); // Prevent browser context menu
      console.log('Right click detected at:', e.latlng);
      setContextMenuPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
      setShowNoteModal(true);
    });

    // Simple right-click to add note directly
    map.getContainer().addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const latlng = map.mouseEventToLatLng(e as any);
      console.log('Adding note at:', latlng);
      
      // Directly set position and show modal
      setContextMenuPosition({ lat: latlng.lat, lng: latlng.lng });
      createTempMarker(latlng.lat, latlng.lng);
      setShowNoteModal(true);
    });

    // Handle map clicks during note placement mode
    map.on('click', (e) => {
      if (isPlacingNote) {
        // User clicked to confirm position, show modal
        setContextMenuPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
        
        // Update temp marker position
        if (tempMarker) {
          tempMarker.setLatLng([e.latlng.lat, e.latlng.lng]);
        } else {
          createTempMarker(e.latlng.lat, e.latlng.lng);
        }
        
        // Show note modal and exit placement mode
        setShowNoteModal(true);
        setIsPlacingNote(false);
        
        // Reset cursor
        map.getContainer().style.cursor = '';
      }
    });

    // Handle escape key to cancel note placement
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPlacingNote) {
        setIsPlacingNote(false);
        
        // Remove temp marker
        if (tempMarker) {
          map.removeLayer(tempMarker);
          setTempMarker(null);
        }
        
        // Reset cursor
        map.getContainer().style.cursor = '';
        setContextMenuPosition(null);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup function
    const cleanup = () => {
      document.removeEventListener('keydown', handleKeyDown);
    };

    mapInstanceRef.current = map;
    (window as any).mapInstance = map;
    
    // Add global map move function
    (window as any).moveMapTo = (lat: number, lng: number, zoom: number) => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([lat, lng], zoom, { animate: true, duration: 1 });
      }
    };

    // Add global employee selection function
    (window as any).selectEmployee = (employeeId: number) => {
      const employee = employees.find(emp => emp.id === employeeId);
      if (employee && onEmployeeSelect) {
        onEmployeeSelect(employee);
      }
    };

    // Add global center on employee function
    (window as any).centerOnEmployee = (employeeId: number) => {
      const employee = employees.find(emp => emp.id === employeeId);
      if (employee && employee.latitude && employee.longitude && mapInstanceRef.current) {
        const lat = parseFloat(employee.latitude);
        const lng = parseFloat(employee.longitude);
        mapInstanceRef.current.setView([lat, lng], 16, { animate: true, duration: 1 });
      }
    };

    return () => {
      cleanup();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        delete (window as any).mapInstance;
        delete (window as any).moveMapTo;
      }
    };
  }, []);

  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  // Add note function
  const addNote = (noteText: string, iconType: string) => {
    if (!contextMenuPosition) return;
    
    const newNote: MapNote = {
      id: Date.now().toString(),
      latitude: contextMenuPosition.lat,
      longitude: contextMenuPosition.lng,
      title: noteTitle,
      note: noteText,
      icon: iconType,
      assignedTo: assignedTo,
      createdAt: new Date()
    };
    
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    
    // Send notes to parent component for sidebar display
    if (onNotesChange) {
      onNotesChange(updatedNotes);
    }
    
    // Remove temporary marker
    if (tempMarker && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(tempMarker);
      setTempMarker(null);
    }

    setShowNoteModal(false);
    setContextMenuPosition(null);
  };

  // Delete note function
  const deleteNote = (noteId: string) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    setNotes(updatedNotes);
    
    // Send updated notes to parent component
    if (onNotesChange) {
      onNotesChange(updatedNotes);
    }
  };

  // Update note function
  const updateNote = (updatedNote: MapNote) => {
    const updatedNotes = notes.map(note => 
      note.id === updatedNote.id ? updatedNote : note
    );
    setNotes(updatedNotes);
    
    // Send updated notes to parent component
    if (onNotesChange) {
      onNotesChange(updatedNotes);
    }
  };

  // Create temporary marker for note placement
  const createTempMarker = (lat: number, lng: number) => {
    if (!mapInstanceRef.current) return;
    
    // Remove existing temporary marker if any
    if (tempMarker) {
      mapInstanceRef.current.removeLayer(tempMarker);
    }
    
    const tempIcon = L.divIcon({
      className: "temp-note-marker",
      html: `
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: #3B82F6;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
          cursor: move;
          animation: pulse 2s infinite;
        ">
          <i class="fas fa-plus"></i>
        </div>
        <style>
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        </style>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
    
    const newTempMarker = L.marker([lat, lng], { 
      icon: tempIcon,
      draggable: true 
    }).addTo(mapInstanceRef.current);
    
    // Update context position when temp marker is dragged
    newTempMarker.on('dragend', () => {
      const newPos = newTempMarker.getLatLng();
      setContextMenuPosition({ lat: newPos.lat, lng: newPos.lng });
    });

    // Double click on temp marker to confirm position during placement mode
    newTempMarker.on('dblclick', () => {
      console.log('Double click on temp marker, isPlacingNote:', isPlacingNote);
      setShowNoteModal(true);
      setIsPlacingNote(false);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.getContainer().style.cursor = '';
      }
    });
    
    setTempMarker(newTempMarker);
  };

  // Add global delete and edit functions and event listeners
  useEffect(() => {
    (window as any).deleteNote = deleteNote;
    (window as any).editNote = (noteId: string) => {
      const note = notes.find(n => n.id === noteId);
      if (note) {
        setEditingNote(note);
        setShowEditModal(true);
      }
    };
    
    // Add custom event listener for adding notes via button
    const handleAddNote = (event: CustomEvent) => {
      // Start note placement mode
      setIsPlacingNote(true);
      setContextMenuPosition(event.detail);
      createTempMarker(event.detail.lat, event.detail.lng);
      
      // Change cursor to crosshair
      if (mapInstanceRef.current) {
        mapInstanceRef.current.getContainer().style.cursor = 'crosshair';
      }
    };
    
    window.addEventListener('addNote', handleAddNote as EventListener);
    
    return () => {
      delete (window as any).deleteNote;
      delete (window as any).editNote;
      window.removeEventListener('addNote', handleAddNote as EventListener);
    };
  }, [notes]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Clear existing cluster group
    if (clusterGroupRef.current) {
      map.removeLayer(clusterGroupRef.current);
    }

    // Create new marker cluster group with Arabic styling
    const clusterGroup = (L as any).markerClusterGroup({
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      spiderfyOnMaxZoom: true,
      removeOutsideVisibleBounds: true,
      iconCreateFunction: function(cluster: any) {
        const count = cluster.getChildCount();
        let className = 'marker-cluster marker-cluster-';
        
        // Different styles based on cluster size
        if (count < 5) {
          className += 'small';
        } else if (count < 15) {
          className += 'medium';
        } else {
          className += 'large';
        }

        return L.divIcon({
          html: `<div class="cluster-inner">
                   <span style="font-family: 'Cairo', sans-serif; font-weight: bold;">${count}</span>
                 </div>`,
          className: className,
          iconSize: [40, 40]
        });
      }
    });

    clusterGroupRef.current = clusterGroup;

    // Add employee markers to cluster group
    employees.forEach(employee => {
      if (!employee.latitude || !employee.longitude) return;

      const lat = parseFloat(employee.latitude);
      const lng = parseFloat(employee.longitude);

      // Create custom icon based on status
      const getMarkerColor = (status: string) => {
        switch (status) {
          case "available": return "#2E7D32";
          case "busy": return "#D32F2F";
          case "offline": return "#9E9E9E";
          default: return "#9E9E9E";
        }
      };

      const markerIcon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background-color: ${getMarkerColor(employee.status)};
            border: 4px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            cursor: pointer;
            ${employee.status === "offline" ? "opacity: 0.7;" : ""}
            ${selectedEmployee?.id === employee.id ? "transform: scale(1.2);" : ""}
          ">
            <i class="fas fa-user"></i>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([lat, lng], { icon: markerIcon });

      // Add popup with employee info
      const statusText = {
        available: "متاح",
        busy: "مشغول",
        offline: "غير متصل"
      }[employee.status] || employee.status;

      // Format last update time
      const formatLastUpdate = (lastUpdate: string | Date) => {
        const date = new Date(lastUpdate);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        
        if (diffMins < 1) return "الآن";
        if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `منذ ${diffHours} ساعة`;
        const diffDays = Math.floor(diffHours / 24);
        return `منذ ${diffDays} يوم`;
      };

      const popupContent = `
        <div style="direction: rtl; text-align: right; font-family: 'Cairo', sans-serif; width: 280px; max-width: 300px;">
          <!-- Header with name and status -->
          <div style="
            display: flex; 
            align-items: center; 
            gap: 8px; 
            margin-bottom: 12px; 
            padding-bottom: 8px; 
            border-bottom: 1px solid #E5E7EB;
          ">
            <div style="
              width: 12px; 
              height: 12px; 
              border-radius: 50%; 
              background-color: ${getMarkerColor(employee.status)};
            "></div>
            <h3 style="margin: 0; font-weight: bold; flex: 1;">${employee.name}</h3>
            <span style="
              padding: 2px 8px; 
              background: #F3F4F6; 
              border-radius: 12px; 
              font-size: 11px; 
              color: ${getMarkerColor(employee.status)};
              font-weight: bold;
            ">${statusText}</span>
          </div>

          <!-- Contact Info -->
          <div style="margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <i class="fas fa-phone" style="color: #3B82F6; width: 16px;"></i>
              <span style="font-size: 13px;">${employee.phone}</span>
              <button onclick="window.open('tel:${employee.phone}', '_self')" 
                style="
                  margin-right: auto; 
                  padding: 4px 8px; 
                  background: #10B981; 
                  color: white; 
                  border: none; 
                  border-radius: 4px; 
                  font-size: 11px; 
                  cursor: pointer;
                "
              >
                اتصال
              </button>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <i class="fas fa-map-marker-alt" style="color: #EF4444; width: 16px;"></i>
              <span style="font-size: 13px;">${employee.location || "غير محدد"}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <i class="fas fa-clock" style="color: #6B7280; width: 16px;"></i>
              <span style="font-size: 12px; color: #6B7280;">آخر تحديث: ${formatLastUpdate(employee.lastUpdate || new Date())}</span>
            </div>
          </div>

          <!-- Languages -->
          ${employee.languages && employee.languages.length > 0 ? `
          <div style="margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <i class="fas fa-language" style="color: #8B5CF6; width: 16px;"></i>
              <span style="font-size: 12px; font-weight: bold;">اللغات:</span>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 4px;">
              ${employee.languages.map(lang => `
                <span style="
                  padding: 2px 6px; 
                  background: #EEF2FF; 
                  color: #3730A3; 
                  border-radius: 8px; 
                  font-size: 10px;
                ">${lang}</span>
              `).join('')}
            </div>
          </div>
          ` : ''}

          <!-- Training Courses -->
          ${employee.trainingCourses && employee.trainingCourses.length > 0 ? `
          <div style="margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <i class="fas fa-graduation-cap" style="color: #F59E0B; width: 16px;"></i>
              <span style="font-size: 12px; font-weight: bold;">الدورات التدريبية:</span>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 4px;">
              ${employee.trainingCourses.map(course => `
                <span style="
                  padding: 2px 6px; 
                  background: #FEF3C7; 
                  color: #92400E; 
                  border-radius: 8px; 
                  font-size: 10px;
                ">${course}</span>
              `).join('')}
            </div>
          </div>
          ` : ''}

          <!-- Customer Assignment -->
          ${employee.customerName ? `
          <div style="
            margin-bottom: 12px; 
            padding: 8px; 
            background: #FEF2F2; 
            border-radius: 6px; 
            border-right: 3px solid #EF4444;
          ">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <i class="fas fa-user-tie" style="color: #EF4444; width: 16px;"></i>
              <span style="font-size: 12px; font-weight: bold; color: #991B1B;">مكلف بعميل:</span>
            </div>
            <p style="margin: 0; font-size: 13px; color: #7F1D1D;">${employee.customerName}</p>
          </div>
          ` : ''}

          <!-- Action Buttons -->
          <div style="display: flex; gap: 6px; margin-top: 12px;">
            <button onclick="window.selectEmployee(${employee.id})" 
              style="
                flex: 1; 
                padding: 6px 12px; 
                background: #3B82F6; 
                color: white; 
                border: none; 
                border-radius: 6px; 
                font-size: 12px; 
                cursor: pointer;
              "
            >
              عرض التفاصيل
            </button>
            <button onclick="window.centerOnEmployee(${employee.id})" 
              style="
                flex: 1; 
                padding: 6px 12px; 
                background: #10B981; 
                color: white; 
                border: none; 
                border-radius: 6px; 
                font-size: 12px; 
                cursor: pointer;
              "
            >
              تركيز الخريطة
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      // Handle marker click
      marker.on("click", () => {
        onEmployeeSelect(employee);
      });

      // Add marker to cluster group
      clusterGroup.addLayer(marker);
      markersRef.current[employee.id] = marker;
    });

    // Add cluster group to map
    map.addLayer(clusterGroup);
  }, [employees, selectedEmployee, onEmployeeSelect]);

  // Add map notes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Clear existing note markers
    Object.values(noteMarkersRef.current).forEach(marker => marker.remove());
    noteMarkersRef.current = {};

    // Add note markers
    notes.forEach(note => {
      const noteIcon = L.divIcon({
        className: "note-marker",
        html: `
          <div style="
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background-color: #3B82F6;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            cursor: pointer;
          ">
            <i class="fas ${note.icon}"></i>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([note.latitude, note.longitude], { 
        icon: noteIcon,
        draggable: true 
      }).addTo(map);

      // Get assigned employee name
      const getAssignedName = (assignedTo: string) => {
        if (assignedTo === "all") return "جميع الموظفين";
        if (assignedTo === "neighborhood") return "موظفين الحي";
        const employee = employees.find(emp => emp.id.toString() === assignedTo);
        return employee ? employee.name : "غير محدد";
      };

      const popupContent = `
        <div style="direction: rtl; text-align: right; font-family: 'Cairo', sans-serif;">
          <h4 style="margin: 0 0 8px 0; font-weight: bold; color: #3B82F6;">
            <i class="fas ${note.icon}" style="margin-left: 5px;"></i>
            ${note.title || 'ملاحظة'}
          </h4>
          <p style="margin: 4px 0; line-height: 1.4;">${note.note}</p>
          <div style="margin: 8px 0; padding: 6px; background: #F3F4F6; border-radius: 4px;">
            <p style="margin: 0; font-size: 11px; color: #666;">
              <strong>مسند إلى:</strong> ${getAssignedName(note.assignedTo || "all")}
            </p>
          </div>
          <p style="margin: 4px 0 0 0; font-size: 11px; color: #666;">
            ${new Date(note.createdAt).toLocaleString('ar-SA')}
          </p>
          <div style="margin-top: 8px; display: flex; gap: 4px;">
            <button 
              onclick="window.editNote('${note.id}')"
              style="flex: 1; padding: 4px 8px; background: #3B82F6; color: white; border: none; border-radius: 4px; font-size: 11px; cursor: pointer;"
            >
              تحرير
            </button>
            <button 
              onclick="window.deleteNote('${note.id}')"
              style="flex: 1; padding: 4px 8px; background: #EF4444; color: white; border: none; border-radius: 4px; font-size: 11px; cursor: pointer;"
            >
              حذف
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      
      // Add double-click event for editing
      marker.on('dblclick', () => {
        setEditingNote(note);
        setShowEditModal(true);
      });

      // Add drag event to update note position
      marker.on('dragend', () => {
        const newPos = marker.getLatLng();
        const updatedNote = {
          ...note,
          latitude: newPos.lat,
          longitude: newPos.lng
        };
        updateNote(updatedNote);
      });
      
      noteMarkersRef.current[note.id] = marker;
    });
  }, [notes]);

  // Center map on selected employee
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedEmployee || !selectedEmployee.latitude || !selectedEmployee.longitude) return;

    const lat = parseFloat(selectedEmployee.latitude);
    const lng = parseFloat(selectedEmployee.longitude);
    mapInstanceRef.current.setView([lat, lng], 15, { animate: true });
  }, [selectedEmployee]);

  const iconOptions = [
    { value: "fa-sticky-note", label: "ملاحظة", icon: "fa-sticky-note" },
    { value: "fa-car", label: "سيارة", icon: "fa-car" },
    { value: "fa-truck", label: "شحنة", icon: "fa-truck" },
    { value: "fa-exclamation-triangle", label: "تحذير", icon: "fa-exclamation-triangle" },
    { value: "fa-tools", label: "صيانة", icon: "fa-tools" },
    { value: "fa-flag", label: "علامة", icon: "fa-flag" },
    { value: "fa-map-pin", label: "موقع مهم", icon: "fa-map-pin" },
    { value: "fa-wrench", label: "إصلاح", icon: "fa-wrench" }
  ];

  const handleSubmitNote = () => {
    if (noteTitle.trim() && noteText.trim()) {
      addNote(noteText, selectedIcon);
      setShowNoteModal(false);
      setNoteTitle("");
      setNoteText("");
      setAssignedTo("all");
      setSelectedIcon("fa-sticky-note");
      
      // Remove temporary marker
      if (tempMarker && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(tempMarker);
        setTempMarker(null);
      }
      
      setContextMenuPosition(null);
    }
  };

  return (
    <div className={className}>
      {/* Note placement indicator */}
      {isPlacingNote && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1001] bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg border">
          <div className="flex items-center gap-2 text-sm">
            <i className="fas fa-crosshairs"></i>
            <div className="flex flex-col">
              <span>انقر على الخريطة أو اسحب الدبوس الأزرق لتحديد الموقع</span>
              <span className="text-xs opacity-75">(ضغط مزدوج على الدبوس أو نقرة واحدة للتأكيد • ESC للإلغاء)</span>
            </div>
          </div>
        </div>
      )}
      
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Add Note Modal */}
      <Dialog open={showNoteModal} onOpenChange={setShowNoteModal}>
        <DialogContent className="max-w-md" dir="rtl" style={{ zIndex: 9999 }}>
          <DialogHeader>
            <DialogTitle className="text-right">إضافة ملاحظة على الخريطة</DialogTitle>
            <p className="text-sm text-gray-600 text-right mt-2">
              💡 يمكنك سحب الدبوس الأزرق لتعديل الموقع قبل حفظ الملاحظة
            </p>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="noteTitle" className="text-sm font-medium">
                عنوان الملاحظة
              </Label>
              <input
                id="noteTitle"
                type="text"
                placeholder="أدخل عنوان الملاحظة..."
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <Label htmlFor="noteText" className="text-sm font-medium">
                نص الملاحظة
              </Label>
              <Textarea
                id="noteText"
                placeholder="اكتب ملاحظتك هنا..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="assignedTo" className="text-sm font-medium">
                إسناد الملاحظة إلى
              </Label>
              <select
                id="assignedTo"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">جميع الموظفين في المنطقة</option>
                <option value="neighborhood">موظفين الحي المحيط</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id.toString()}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-3 block">
                اختر الأيقونة
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {iconOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedIcon(option.value)}
                    className={`p-3 border rounded-lg text-center hover:bg-gray-50 transition-colors ${
                      selectedIcon === option.value
                        ? "border-blue-500 bg-blue-50 text-blue-600"
                        : "border-gray-200"
                    }`}
                  >
                    <i className={`fas ${option.icon} text-lg mb-1 block`}></i>
                    <span className="text-xs">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSubmitNote}
                disabled={!noteTitle.trim() || !noteText.trim()}
                className="flex-1"
              >
                إضافة الملاحظة
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowNoteModal(false);
                  setNoteTitle("");
                  setNoteText("");
                  setAssignedTo("all");
                  setSelectedIcon("fa-sticky-note");
                  
                  // Remove temporary marker
                  if (tempMarker && mapInstanceRef.current) {
                    mapInstanceRef.current.removeLayer(tempMarker);
                    setTempMarker(null);
                  }
                  
                  setContextMenuPosition(null);
                }}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Note Modal */}
      <EditNoteModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        note={editingNote}
        onSave={updateNote}
        onDelete={deleteNote}
      />
    </div>
  );
}