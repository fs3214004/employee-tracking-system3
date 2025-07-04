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
import { Textarea } from "@/components/ui/textarea";
import { employeeApi } from "@/lib/employee-api";
import { useToast } from "@/hooks/use-toast";
import type { Employee } from "@shared/schema";

const assignmentSchema = z.object({
  customerId: z.string().min(1, "رقم العميل مطلوب"),
  customerName: z.string().min(1, "اسم العميل مطلوب"),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),
  notes: z.string().optional(),
});

type AssignmentData = z.infer<typeof assignmentSchema>;

interface AssignCustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee;
  onSuccess: () => void;
}

export function AssignCustomerModal({ open, onOpenChange, employee, onSuccess }: AssignCustomerModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AssignmentData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      customerId: "",
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      notes: "",
    },
  });

  const assignMutation = useMutation({
    mutationFn: ({ customerId, customerName }: { customerId: string; customerName: string }) =>
      employeeApi.assignToCustomer(employee.id, customerId, customerName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({
        title: "تم التوجيه",
        description: `تم توجيه ${employee.name} إلى العميل بنجاح`,
      });
      form.reset();
      onOpenChange(false);
      onSuccess();
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في توجيه الموظف إلى العميل",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AssignmentData) => {
    assignMutation.mutate({
      customerId: data.customerId,
      customerName: data.customerName,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>توجيه موظف إلى عميل</DialogTitle>
        </DialogHeader>

        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <i className="fas fa-user text-blue-600"></i>
            <span className="font-medium">الموظف:</span>
            <span>{employee.name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm mt-1">
            <i className="fas fa-phone text-blue-600"></i>
            <span>{employee.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm mt-1">
            <i className="fas fa-map-marker-alt text-blue-600"></i>
            <span>{employee.location || "غير محدد"}</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم العميل</FormLabel>
                  <FormControl>
                    <Input placeholder="CUST001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم العميل</FormLabel>
                  <FormControl>
                    <Input placeholder="اسم العميل أو الشركة" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم هاتف العميل (اختياري)</FormLabel>
                  <FormControl>
                    <Input placeholder="05XXXXXXXX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عنوان العميل (اختياري)</FormLabel>
                  <FormControl>
                    <Input placeholder="العنوان التفصيلي" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="أي ملاحظات إضافية حول المهمة"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
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
                disabled={assignMutation.isPending}
              >
                {assignMutation.isPending ? "جاري التوجيه..." : "توجيه الموظف"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
