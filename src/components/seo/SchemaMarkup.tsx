"use client";

import { ReactNode } from "react";

interface SchemaMarkupProps {
  schema: Record<string, any>;
  children?: ReactNode;
}

/**
 * Component to inject JSON-LD schema markup into the page
 * This component is a client component that renders a script tag
 */
export default function SchemaMarkup({ schema, children }: SchemaMarkupProps) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema),
        }}
      />
      {children}
    </>
  );
}
