import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-muted-foreground">
              We&apos;ve sent a confirmation link to your email. Please click it to verify your account.
            </p>
            <p className="text-sm text-muted-foreground">
              After confirming your email, you can log in to access the dashboard.
            </p>
            <Link href="/auth/login">
              <Button className="w-full">Back to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
