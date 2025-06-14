import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  gradientClasses: string;
  className?: string;
}

export function SummaryCard({ title, value, icon, gradientClasses, className }: SummaryCardProps) {
  return (
    <Card className={cn("text-primary-foreground shadow-xl hover:shadow-2xl transition-shadow duration-300", gradientClasses, className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
