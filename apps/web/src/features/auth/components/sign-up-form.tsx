import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import z from "zod";

import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

import { useAuth } from "../lib/hooks";

export const SignUpForm = ({
  onSwitchToSignIn,
}: {
  onSwitchToSignIn: () => void;
}) => {
  const router = useRouter();
  const { isPending } = useAuth();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      username: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.username, // Use username as name
          username: value.username,
        } as any,
        {
          onSuccess: () => {
            router.push("/");
            toast.success("Sign up successful");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be at most 20 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="w-full max-w-sm space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Sign Up</h1>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Join the community and start logging
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
          <form.Field name="username">
            {(field) => (
              <div className="grid gap-1.5">
                <Label htmlFor={field.name} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Username
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

          <form.Field name="email">
            {(field) => (
              <div className="grid gap-1.5">
                <Label htmlFor={field.name} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Email
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  placeholder="m@example.com"
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
              {state.isSubmitting ? "Creating..." : "Create Account"}
            </Button>
          )}
        </form.Subscribe>

        <div className="text-center">
          <button
            type="button"
            onClick={onSwitchToSignIn}
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:underline"
          >
            Already have an account? Sign In
          </button>
        </div>
      </form>
    </div>
  );
};
