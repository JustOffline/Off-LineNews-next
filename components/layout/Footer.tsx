import { buttonVariants } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 border-t border-border px-6 py-10 sm:px-12">
      <a
        href="https://justoffline.substack.com/"
        target="_blank"
        rel="noopener noreferrer"
        className={buttonVariants({ variant: "default" })}
      >
        Subscribe on Substack ↗
      </a>
    </footer>
  );
}
