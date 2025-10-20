import { LoginForm } from "@/widgets/auth"
import {ExcludeLayout} from "@/shared/utils";

export default function Page() {
  return (
    <ExcludeLayout className="flex min-h-screen w-full items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </ExcludeLayout>
  )
}
