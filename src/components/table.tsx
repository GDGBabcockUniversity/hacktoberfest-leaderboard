import Image from "next/image";
import { Card } from "@/components/ui/card";

export function Empty({ children }: { children: React.ReactNode }) {
  return <Card className="p-10 text-center text-muted-foreground">{children}</Card>;
}
export function Person({
  name,
  avatar,
}: {
  name: string;
  avatar: string | null;
}) {
  return (
    <span className="flex items-center gap-2">
      {avatar && (
        <Image
          src={avatar}
          width={28}
          height={28}
          className="rounded-full"
          alt=""
        />
      )}
      {name}
    </span>
  );
}
