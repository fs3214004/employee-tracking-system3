import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { employeeApi } from "@/lib/employee-api";
import type { Employee } from "@shared/schema";


interface EmployeeSidebarProps {
  selectedEmployee: Employee | null;
  onEmployeeSelect: (employee: Employee) => void;
  onAddEmployee: () => void;
}

export function EmployeeSidebar({ selectedEmployee, onEmployeeSelect, onAddEmployee }: EmployeeSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);


  const { data: employees = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/employees"],
    queryFn: employeeApi.getAll,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           employee.phone.includes(searchQuery) ||
                           (employee.location || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = !statusFilter || employee.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [employees, searchQuery, statusFilter]);

  const statusCounts = useMemo(() => {
    return employees.reduce((acc, emp) => {
      acc[emp.status] = (acc[emp.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [employees]);

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

  const handleCall = (phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`tel:${phone}`, '_self');
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available": return "متاح";
      case "busy": return "مشغول";
      case "offline": return "غير متصل";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-available";
      case "busy": return "bg-busy";
      case "offline": return "bg-offline";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="w-64 bg-white shadow-lg border-l border-gray-200 flex flex-col h-full max-h-screen">
        {/* Search and filters */}
        <div className="p-3 border-b border-gray-200">
          <div className="relative mb-3">
            <Input
              type="text"
              placeholder="البحث عن موظف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-sm h-8"
            />
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
          </div>
          
          {/* Status filters */}
          <div className="flex gap-1 mb-3">
            <Button
              variant={statusFilter === "available" ? "default" : "outline"}
              size="sm"
              className={`flex-1 text-xs py-1 px-2 h-7 ${statusFilter === "available" ? "bg-available hover:bg-available/90" : ""}`}
              onClick={() => setStatusFilter(statusFilter === "available" ? null : "available")}
            >
              متاح ({statusCounts.available || 0})
            </Button>
            <Button
              variant={statusFilter === "busy" ? "default" : "outline"}
              size="sm"
              className={`flex-1 text-xs py-1 px-2 h-7 ${statusFilter === "busy" ? "bg-busy hover:bg-busy/90" : ""}`}
              onClick={() => setStatusFilter(statusFilter === "busy" ? null : "busy")}
            >
              مشغول ({statusCounts.busy || 0})
            </Button>
            <Button
              variant={statusFilter === "offline" ? "default" : "outline"}
              size="sm"
              className={`flex-1 text-xs py-1 px-2 h-7 ${statusFilter === "offline" ? "bg-offline hover:bg-offline/90" : ""}`}
              onClick={() => setStatusFilter(statusFilter === "offline" ? null : "offline")}
            >
              غير متصل ({statusCounts.offline || 0})
            </Button>
          </div>


        </div>

        {/* Employee list */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">جاري التحميل...</div>
          ) : filteredEmployees.length === 0 ? (
            <div className="p-4 text-center text-gray-500">لا توجد نتائج</div>
          ) : (
            filteredEmployees.map(employee => (
              <div
                key={employee.id}
                className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedEmployee?.id === employee.id ? "bg-blue-50 border-blue-200" : ""
                } ${employee.status === "offline" ? "opacity-75" : ""}`}
                onClick={() => onEmployeeSelect(employee)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(employee.status)}`}></div>
                    <span className="font-medium">{employee.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-blue-700 p-1"
                    onClick={(e) => handleCall(employee.phone, e)}
                    disabled={employee.status === "offline"}
                  >
                    <i className="fas fa-phone text-sm"></i>
                  </Button>
                </div>
                
                <div className="text-sm text-gray-600 mb-1">
                  <i className="fas fa-phone text-xs ml-1"></i>
                  {employee.phone}
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  <i className="fas fa-map-marker-alt text-xs ml-1"></i>
                  {employee.location || "غير محدد"}
                </div>
                
                {employee.status === "busy" && employee.customerName ? (
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      مع عميل: <span className="font-medium">{employee.customerName}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs bg-orange-50 text-orange-600">
                      مشغول
                    </Badge>
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">
                    {employee.status === "offline" ? "آخر ظهور: " : "آخر تحديث: "}
                    {formatLastUpdate(employee.lastUpdate || new Date())}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
  );
}
