import { AppShell } from "@/components/app-shell"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
export default function ProfilePage() {
  return (
    <AppShell>
      <Card>
        <CardContent className="flex items-center gap-4 p-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="/avatar.png" />
            <AvatarFallback>MD</AvatarFallback>
          </Avatar>
          <div>
            <div className="text-lg font-semibold">Moodmacther</div>
            <div className="text-sm text-muted-foreground">Edit profile → (nyusul)</div>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  )
}
