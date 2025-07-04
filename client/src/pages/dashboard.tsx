import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { EmployeeSidebar } from "@/components/employee-sidebar";
import { Map, type MapNote } from "@/components/ui/map";
import { EmployeeDetails } from "@/components/employee-details";
import { LocationFilters } from "@/components/location-filters";
import { employeeApi } from "@/lib/employee-api";
import type { Employee } from "@shared/schema";

export default function Dashboard() {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null);
  const [mapNotes, setMapNotes] = useState<MapNote[]>([]);

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["/api/employees"],
    queryFn: employeeApi.getAll,
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  });

  // Filter employees based on selected location
  const filteredEmployees = employees.filter((employee) => {
    if (selectedRegion && employee.regionId !== selectedRegion) return false;
    if (selectedCity && employee.cityId !== selectedCity) return false;
    if (selectedNeighborhood && employee.neighborhoodId !== selectedNeighborhood) return false;
    return true;
  });

  // Calculate status counts for the header
  const statusCounts = filteredEmployees.reduce((acc, emp) => {
    acc[emp.status] = (acc[emp.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <i className="fas fa-map-marker-alt text-primary text-xl"></i>
            <h1 className="text-xl font-semibold text-gray-900">نظام تتبع الموظفين</h1>
            <span className="text-sm text-gray-500">الرياض</span>
          </div>

          {/* Location Filters */}
          <div className="flex-1 max-w-2xl mx-8">
            <LocationFilters
              selectedRegion={selectedRegion}
              selectedCity={selectedCity}
              selectedNeighborhood={selectedNeighborhood}
              onRegionChange={setSelectedRegion}
              onCityChange={setSelectedCity}
              onNeighborhoodChange={setSelectedNeighborhood}
              onMapMove={(lat, lng, zoom) => {
                // Use global map move function
                (window as any).moveMapTo?.(lat, lng, zoom);
              }}
            />
          </div>
          
          <div className="flex items-center gap-4">
            {/* Real-time indicator */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-available rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">متصل</span>
            </div>
            
            {/* Status summary */}
            <div className="hidden md:flex items-center gap-4 text-sm">
              <span className="text-available font-medium">
                متاح: {statusCounts.available || 0}
              </span>
              <span className="text-busy font-medium">
                مشغول: {statusCounts.busy || 0}
              </span>
              <span className="text-offline font-medium">
                غير متصل: {statusCounts.offline || 0}
              </span>
            </div>
            
            {/* User info */}
            <div className="flex items-center gap-2">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40" 
                alt="المدير" 
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm font-medium hidden md:block">أحمد المدير</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <EmployeeSidebar
          selectedEmployee={selectedEmployee}
          onEmployeeSelect={setSelectedEmployee}
          onAddEmployee={() => {}} // Handled in the sidebar component
        />
        
        {/* Map Container */}
        <div className="flex-1 relative min-h-0">
          {/* Map controls */}
          <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
            <button 
              className="bg-white p-3 rounded-lg shadow-md hover:shadow-lg transition-shadow border hover:bg-gray-50"
              title="تكبير"
              onClick={() => {
                const map = (window as any).mapInstance;
                if (map) map.zoomIn();
              }}
            >
              <i className="fas fa-plus text-gray-600"></i>
            </button>
            <button 
              className="bg-white p-3 rounded-lg shadow-md hover:shadow-lg transition-shadow border hover:bg-gray-50"
              title="تصغير"
              onClick={() => {
                const map = (window as any).mapInstance;
                if (map) map.zoomOut();
              }}
            >
              <i className="fas fa-minus text-gray-600"></i>
            </button>
            <button 
              className="bg-white p-3 rounded-lg shadow-md hover:shadow-lg transition-shadow border hover:bg-gray-50"
              title="عرض المملكة العربية السعودية"
              onClick={() => {
                const map = (window as any).mapInstance;
                if (map) map.setView([24.0, 45.0], 6);
              }}
            >
              <i className="fas fa-home text-gray-600"></i>
            </button>
            <button 
              className="bg-blue-500 text-white p-3 rounded-lg shadow-md hover:shadow-lg transition-shadow border hover:bg-blue-600"
              title="إضافة ملاحظة (أو انقر بالزر الأيمن على الخريطة)"
              onClick={() => {
                // Open modal at center of current map view
                const center = { lat: 24.7136, lng: 46.6753 }; // Riyadh center as fallback
                window.dispatchEvent(new CustomEvent('addNote', { detail: center }));
              }}
            >
              <i className="fas fa-sticky-note"></i>
            </button>
          </div>
          
          {/* Map legend */}
          <div className="absolute top-4 left-4 z-[1000] bg-white p-3 rounded-lg shadow-md border max-w-xs max-h-96 overflow-hidden flex flex-col">
            <h3 className="text-sm font-medium mb-3">دليل الألوان</h3>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-available rounded-full"></div>
                <span className="text-xs">متاح</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-busy rounded-full"></div>
                <span className="text-xs">مشغول</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-offline rounded-full"></div>
                <span className="text-xs">غير متصل</span>
              </div>
            </div>
            <div className="border-t pt-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-xs">ملاحظات</span>
              </div>
            </div>
            
            {/* Map Notes Section */}
            {mapNotes.length > 0 && (
              <div className="border-t pt-3 mt-3">
                <div className="flex items-center gap-2 mb-3">
                  <i className="fas fa-sticky-note text-blue-500 text-xs"></i>
                  <span className="text-xs font-medium">ملاحظات الخريطة ({mapNotes.length})</span>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto flex-1">
                  {mapNotes.map((note) => (
                    <div
                      key={note.id}
                      className="p-2 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => {
                        // Move to note location on map
                        const map = (window as any).mapInstance;
                        if (map) {
                          map.setView([note.latitude, note.longitude], 16, { animate: true });
                        }
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <i className={`fas ${note.icon} text-blue-500 text-xs mt-0.5`}></i>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-medium text-gray-900 truncate mb-1" title={note.title || 'ملاحظة'}>
                            {note.title || 'ملاحظة'}
                          </h5>
                          <p className="text-xs text-gray-600 leading-relaxed truncate" title={note.note}>
                            {note.note}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500">
                              {typeof note.createdAt === 'string' ? 
                                new Date(note.createdAt).toLocaleString('ar-SA', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) :
                                note.createdAt.toLocaleString('ar-SA', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              }
                            </span>
                            <span className="text-xs text-blue-600 bg-blue-50 px-1 rounded">
                              {note.assignedTo === 'all' ? 'الكل' : 
                               note.assignedTo === 'neighborhood' ? 'الحي' : 'خاص'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Map */}
          <Map
            employees={filteredEmployees}
            selectedEmployee={selectedEmployee}
            onEmployeeSelect={setSelectedEmployee}
            className="w-full h-full"
            onNotesChange={setMapNotes}
          />
          
          {isLoading && (
            <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-[1001]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <span className="text-gray-600">جاري تحميل الخريطة...</span>
              </div>
            </div>
          )}

          {/* Employee details popup */}
          {selectedEmployee && (
            <EmployeeDetails
              employee={selectedEmployee}
              onClose={() => setSelectedEmployee(null)}
            />
          )}
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 md:hidden z-[1000]">
        <div className="flex justify-around">
          <button className="flex flex-col items-center py-2 px-4 text-primary">
            <i className="fas fa-map text-lg mb-1"></i>
            <span className="text-xs">الخريطة</span>
          </button>
          <button className="flex flex-col items-center py-2 px-4 text-gray-600">
            <i className="fas fa-users text-lg mb-1"></i>
            <span className="text-xs">الموظفين</span>
          </button>
          <button className="flex flex-col items-center py-2 px-4 text-gray-600">
            <i className="fas fa-plus text-lg mb-1"></i>
            <span className="text-xs">إضافة</span>
          </button>
          <button className="flex flex-col items-center py-2 px-4 text-gray-600">
            <i className="fas fa-chart-bar text-lg mb-1"></i>
            <span className="text-xs">التقارير</span>
          </button>
        </div>
      </div>
    </div>
  );
}
