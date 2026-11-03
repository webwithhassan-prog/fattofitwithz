"use client";

/** Shown instead of a page when it fails to load (a React error boundary). The screen: components/layout/ErrorContent.tsx */
import { ErrorContent } from "@/components/layout/ErrorContent";

export default function Error(props: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorContent {...props} />;
}
