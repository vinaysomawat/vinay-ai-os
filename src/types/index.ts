// Shared types used across multiple modules.
// Module-specific types live in features/[module]/types.ts

export type ID = string | number

export type ApiResponse<T> = {
  data: T
  error?: string
}
