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
    <div className="w-full max-w-sm space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Sign In</h1>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Enter your credentials to access your logs
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-6"
      >
        <div className="space-y-4">
          <form.Field name="email">
            {(field) => (
              <div className="grid gap-1.5">
                <Label htmlFor={field.name} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Email or Username
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="johndoe"
                  className="h-12 border-none bg-muted px-4 font-bold focus-visible:ring-1 focus-visible:ring-foreground"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-[10px] font-bold uppercase text-destructive">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>

          <form.Field name="password">
            {(field) => (
              <div className="grid gap-1.5">
                <Label htmlFor={field.name} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Password
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  className="h-12 border-none bg-muted px-4 font-bold focus-visible:ring-1 focus-visible:ring-foreground"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-[10px] font-bold uppercase text-destructive">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <form.Subscribe>
          {(state) => (
            <Button
              type="submit"
              className="h-12 w-full text-xs font-black uppercase tracking-widest"
              disabled={!state.canSubmit || state.isSubmitting}
            >
              {state.isSubmitting ? "Authenticating..." : "Sign In"}
            </Button>
          )}
        </form.Subscribe>

        <div className="text-center">
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:underline"
          >
            Don&apos;t have an account? Sign Up
          </button>
        </div>
      </form>
    </div>
  );
}
