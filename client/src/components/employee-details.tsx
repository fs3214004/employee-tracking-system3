import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { employeeApi } from "@/lib/employee-api";
import { useToast } from "@/hooks/use-toast";
import type { Employee } from "@shared/schema";
import { AssignCustomerModal } from "./assign-customer-modal";

interface EmployeeDetailsProps {
  employee: Employee;
  onClose: () => void;
}

export function EmployeeDetails({ employee, onClose }: EmployeeDetailsProps) {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      employeeApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({
        title: "تم تحديث الحالة",
        description: "تم تحديث حالة الموظف بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة الموظف",
        variant: "destructive",
      });
    },
  });

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

  const handleCall = () => {
    window.open(`tel:${employee.phone}`, '_self');
  };

  const handleStatusChange = (newStatus: string) => {
    updateStatusMutation.mutate({ id: employee.id, status: newStatus });
  };

  return (
    <>
      <Card className="absolute bottom-4 right-4 max-w-sm shadow-xl z-10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">تفاصيل الموظف</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <i className="fas fa-times"></i>
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${getStatusColor(employee.status)}`}></div>
              <span className="font-medium">{employee.name}</span>
              <Badge variant="secondary" className="mr-auto">
                {getStatusText(employee.status)}
              </Badge>
            </div>

            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <i className="fas fa-phone"></i>
                  <span>{employee.phone}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-blue-700"
                  onClick={handleCall}
                  disabled={employee.status === "offline"}
                >
                  <i className="fas fa-phone-alt"></i>
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <i className="fas fa-map-marker-alt"></i>
                <span>{employee.location || "غير محدد"}</span>
              </div>

              <div className="flex items-center gap-2">
                <i className="fas fa-clock"></i>
                <span>
                  {employee.status === "offline" ? "آخر ظهور: " : "آخر تحديث: "}
                  {formatLastUpdate(employee.lastUpdate || new Date())}
                </span>
              </div>

              {employee.status === "busy" && employee.customerName && (
                <div className="flex items-center gap-2">
                  <i className="fas fa-user-tie"></i>
                  <span>العميل: {employee.customerName}</span>
                </div>
              )}

              {employee.languages && employee.languages.length > 0 && (
                <div className="flex items-start gap-2">
                  <i className="fas fa-language mt-1"></i>
                  <div>
                    <div className="font-medium text-xs mb-1">اللغات:</div>
                    <div className="flex flex-wrap gap-1">
                      {employee.languages.map((language, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {employee.trainingCourses && employee.trainingCourses.length > 0 && (
                <div className="flex items-start gap-2">
                  <i className="fas fa-graduation-cap mt-1"></i>
                  <div>
                    <div className="font-medium text-xs mb-1">الدورات التدريبية:</div>
                    <div className="flex flex-wrap gap-1">
                      {employee.trainingCourses.map((course, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          {course}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t">
              {employee.status === "available" && (
                <Button
                  className="w-full bg-primary hover:bg-blue-700"
                  onClick={() => setShowAssignModal(true)}
                  disabled={updateStatusMutation.isPending}
                >
                  <i className="fas fa-user-plus ml-2"></i>
                  توجيه إلى عميل
                </Button>
              )}

              {employee.status === "busy" && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleStatusChange("available")}
                  disabled={updateStatusMutation.isPending}
                >
                  <i className="fas fa-check ml-2"></i>
                  تحديد كمتاح
                </Button>
              )}

              <div className="flex gap-2">
                {employee.status !== "offline" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleStatusChange("offline")}
                    disabled={updateStatusMutation.isPending}
                  >
                    غير متصل
                  </Button>
                )}
                {employee.status === "offline" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleStatusChange("available")}
                    disabled={updateStatusMutation.isPending}
                  >
                    متصل
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AssignCustomerModal
        open={showAssignModal}
        onOpenChange={setShowAssignModal}
        employee={employee}
        onSuccess={onClose}
      />
    </>
  );
}
