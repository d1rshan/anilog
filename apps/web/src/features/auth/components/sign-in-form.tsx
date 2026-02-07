import { authClient } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import z from "zod";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useSession } from "../lib/hooks";

export default function SignInForm({
  onSwitchToSignUp,
}: {
  onSwitchToSignUp: () => void;
}) {
  const router = useRouter();
  const { isPending } = useSession();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      const isEmail = value.email.includes("@");

      if (isEmail) {
        // Sign in with email
        await authClient.signIn.email(
          {
            email: value.email,
            password: value.password,
          },
          {
            onSuccess: () => {
              router.push("/");
              toast.success("Sign in successful");
            },
            onError: (error: { error: { message: string; statusText: string } }) => {
              toast.error(error.error.message || error.error.statusText);
            },
          },
        );
      } else {
        // Sign in with username
        await authClient.signIn.username(
          {
            username: value.email,
            password: value.password,
          },
          {
            onSuccess: () => {
              router.push("/");
              toast.success("Sign in successful");
            },
            onError: (error: { error: { message: string; statusText: string } }) => {
              toast.error(error.error.message || error.error.statusText);
            },
          },
        );
      }
    },
    validators: {
      onSubmit: z.object({
        email: z.string().min(1, "Email or username is required"),
        password: z.string().min(1, "Password is required"),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Sign in to your account</CardTitle>
        <CardDescription>
          Enter your email below to sign in to your account
        </CardDescription>
        <CardAction>
          <Button variant="link" onClick={onSwitchToSignUp}>
            Sign Up
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="flex flex-col gap-6">
            <form.Field name="email">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>Email or Username</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    placeholder="johndoe or johndoe@example.com"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors.map((error) => (
                    <p key={error?.message} className="text-sm text-red-500">
                      {error?.message}
                    </p>
                  ))}
                </div>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor={field.name}>Password</Label>
                  </div>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors.map((error) => (
                    <p key={error?.message} className="text-sm text-red-500">
                      {error?.message}
                    </p>
                  ))}
                </div>
              )}
            </form.Field>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <form.Subscribe>
          {(state) => (
            <Button
              type="button"
              className="w-full"
              disabled={!state.canSubmit || state.isSubmitting}
              onClick={() => form.handleSubmit()}
            >
              {state.isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          )}
        </form.Subscribe>
      </CardFooter>
    </Card>
  );
}
