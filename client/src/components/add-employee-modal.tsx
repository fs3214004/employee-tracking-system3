import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { employeeApi } from "@/lib/employee-api";
import { useToast } from "@/hooks/use-toast";
import { insertEmployeeSchema } from "@shared/schema";
import { LocationFilters } from "./location-filters";

const formSchema = insertEmployeeSchema.extend({
  confirmPhone: z.string(),
}).refine(data => data.phone === data.confirmPhone, {
  message: "رقم الهاتف غير متطابق",
  path: ["confirmPhone"],
});

type FormData = z.infer<typeof formSchema>;

const availableLanguages = [
  "العربية",
  "الإنجليزية", 
  "الفرنسية",
  "الألمانية",
  "الإسبانية",
  "الأردية",
  "الهندية",
  "التركية"
];

const availableTrainingCourses = [
  "التسويق الرقمي",
  "المبيعات",
  "خدمة العملاء",
  "إدارة المشاريع",
  "القيادة",
  "التفاوض",
  "إدارة الوقت",
  "التواصل الفعال",
  "حل المشكلات",
  "العمل الجماعي"
];

interface AddEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddEmployeeModal({ open, onOpenChange, onSuccess }: AddEmployeeModalProps) {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      confirmPhone: "",
      status: "available",
      latitude: "",
      longitude: "",
      location: "",
      regionId: "",
      cityId: "",
      neighborhoodId: "",
      languages: [],
      trainingCourses: [],
    },
  });

  const createEmployeeMutation = useMutation({
    mutationFn: employeeApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({
        title: "تم إضافة الموظف",
        description: "تم إضافة الموظف الجديد بنجاح",
      });
      form.reset();
      onOpenChange(false);
      onSuccess();
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إضافة الموظف",
        variant: "destructive",
      });
    },
  });

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "خطأ",
        description: "الموقع الجغرافي غير مدعوم في هذا المتصفح",
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        form.setValue("latitude", latitude.toString());
        form.setValue("longitude", longitude.toString());
        
        // Try to get neighborhood name (this would normally use a geocoding service)
        // For now, we'll set a default location
        form.setValue("location", "الرياض");
        
        setIsGettingLocation(false);
        toast({
          title: "تم تحديد الموقع",
          description: "تم تحديد الموقع الجغرافي بنجاح",
        });
      },
      (error) => {
        setIsGettingLocation(false);
        toast({
          title: "خطأ في الموقع",
          description: "فشل في تحديد الموقع الجغرافي",
          variant: "destructive",
        });
      }
    );
  };

  const onSubmit = (data: FormData) => {
    const { confirmPhone, ...employeeData } = data;
    createEmployeeMutation.mutate(employeeData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إضافة موظف جديد</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم</FormLabel>
                  <FormControl>
                    <Input placeholder="اسم الموظف" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم الهاتف</FormLabel>
                  <FormControl>
                    <Input placeholder="05XXXXXXXX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تأكيد رقم الهاتف</FormLabel>
                  <FormControl>
                    <Input placeholder="05XXXXXXXX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الحالة</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الحالة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="available">متاح</SelectItem>
                      <SelectItem value="busy">مشغول</SelectItem>
                      <SelectItem value="offline">غير متصل</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location Filters */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">الموقع</Label>
              <LocationFilters
                selectedRegion={selectedRegion}
                selectedCity={selectedCity}
                selectedNeighborhood={selectedNeighborhood}
                onRegionChange={(regionId) => {
                  setSelectedRegion(regionId);
                  form.setValue("regionId", regionId || "");
                }}
                onCityChange={(cityId) => {
                  setSelectedCity(cityId);
                  form.setValue("cityId", cityId || "");
                }}
                onNeighborhoodChange={(neighborhoodId) => {
                  setSelectedNeighborhood(neighborhoodId);
                  form.setValue("neighborhoodId", neighborhoodId || "");
                }}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الحي (اختياري)</FormLabel>
                  <FormControl>
                    <Input placeholder="اسم الحي التفصيلي" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>خط العرض</FormLabel>
                    <FormControl>
                      <Input placeholder="24.7136" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>خط الطول</FormLabel>
                    <FormControl>
                      <Input placeholder="46.6753" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
            >
              <i className="fas fa-location-arrow ml-2"></i>
              {isGettingLocation ? "جاري تحديد الموقع..." : "تحديد الموقع الحالي"}
            </Button>

            {/* Languages Selection */}
            <FormField
              control={form.control}
              name="languages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اللغات</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {availableLanguages.map((language) => (
                      <div key={language} className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox
                          id={`language-${language}`}
                          checked={field.value?.includes(language) || false}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...(field.value || []), language]);
                            } else {
                              field.onChange(field.value?.filter((l) => l !== language) || []);
                            }
                          }}
                        />
                        <Label htmlFor={`language-${language}`} className="text-sm">
                          {language}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Training Courses Selection */}
            <FormField
              control={form.control}
              name="trainingCourses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الدورات التدريبية</FormLabel>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {availableTrainingCourses.map((course) => (
                      <div key={course} className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox
                          id={`course-${course}`}
                          checked={field.value?.includes(course) || false}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...(field.value || []), course]);
                            } else {
                              field.onChange(field.value?.filter((c) => c !== course) || []);
                            }
                          }}
                        />
                        <Label htmlFor={`course-${course}`} className="text-sm">
                          {course}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-blue-700"
                disabled={createEmployeeMutation.isPending}
              >
                {createEmployeeMutation.isPending ? "جاري الإضافة..." : "إضافة"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
