# Always-online, no offline support

The repo was scaffolded from a Next.js PWA template, so a reader might expect offline-first behavior. We deliberately rip it out: the actual workflow is end-of-shift batched entry (Operator sits down with wifi after closing the truck), not per-sale logging in the field. Real offline support (IndexedDB queue, sync, conflict resolution) is a large project we do not need yet. If the workflow shifts to per-sale logging on the truck, revisit by adding an offline queue to the create flow rather than restoring the PWA shell wholesale.
