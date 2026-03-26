import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary";

type Base = {
  variant?: Variant;
  className?: string;
  children: ReactNode;
};

const buttonLayout =
  "inline-flex min-h-11 cursor-pointer items-center justify-center px-6 py-2.5 text-center text-sm no-underline transition-[transform,box-shadow,background]";

type EditorialButtonAsLink = Base &
  Omit<ComponentPropsWithoutRef<typeof Link>, "className" | "children">;

type EditorialButtonAsButton = Base &
  Omit<ComponentPropsWithoutRef<"button">, "className" | "children">;

function variantClass(variant: Variant): string {
  return variant === "primary" ? "theme-btn-primary" : "theme-btn-secondary";
}

export function EditorialButton(props: EditorialButtonAsLink): ReactElement;
export function EditorialButton(props: EditorialButtonAsButton): ReactElement;
export function EditorialButton({
  variant = "primary",
  className,
  children,
  ...rest
}: EditorialButtonAsLink | EditorialButtonAsButton): ReactElement {
  const classes = cn(buttonLayout, variantClass(variant), className);

  if ("href" in rest) {
    const { href, ...linkRest } = rest as EditorialButtonAsLink;
    if (typeof href === "string" && /^https?:\/\//i.test(href)) {
      return (
        <a href={href} className={classes} {...(linkRest as ComponentPropsWithoutRef<"a">)}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...linkRest}>
        {children}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } = rest as ComponentPropsWithoutRef<"button">;
  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
