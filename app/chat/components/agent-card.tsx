import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function AgentCard({
  name,
  description,
  icon,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  name: string;
  description: string;
  className?: string;
  icon: React.ComponentType<React.ComponentProps<"svg">>;
}) {
  const Icon = icon;
  return (
    <Card
      {...props}
      className={cn(
        "border-0 shadow-none outline-3 outline-secondary rounded-md min-h-[200px]",
        "hover:outline-primary/50 transition-all duration-300",
        className
      )}
    >
      <CardHeader className="flex items-center gap-2">
        <div className="rounded-md bg-secondary p-1">
          {Icon && <Icon className="size-6" />}
        </div>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{description}</p>
      </CardContent>
    </Card>
  );
}
