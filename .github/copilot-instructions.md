# GitHub Copilot Instructions for Image-to-Video AI Project

## Project Overview

This is an Image-to-Video AI application that:

1. **Scrapes product information** from e-commerce websites using URLs
2. **Generates AI-powered videos** from product images using Kling AI API
3. **Publishes generated videos to Dailymotion platform** for distribution
4. **Tracks video generation and publishing status** in real-time with database persistence
5. **Provides a modern web interface** for managing products, videos, and Dailymotion publishing

## Technology Stack & Architecture

### Frontend (React + TypeScript)

- **React 18** with TypeScript and Tailwind CSS
- **React Query** for state management and API caching
- **Vite** for fast development and building
- **Lucide Icons** for consistent UI iconography

### Backend (Bun + Hono.js)

- **Bun** runtime with **Hono.js** web framework
- **Drizzle ORM** with **SQLite** database
- **Kling AI API** integration for video generation
- **Dailymotion Partner API** integration for video publishing
- **JWT authentication** for external API access

### Key Libraries

- `@tanstack/react-query` - Server state management
- `drizzle-orm` - Type-safe database operations
- `jsonwebtoken` - JWT token generation for Kling AI
- `lucide-react` - Icon components

## Project Structure

```
├── server/                      # Backend API server
│   ├── controllers/             # Route handlers
│   │   ├── dailymotionController.ts # Dailymotion publishing endpoints
│   │   ├── domainsController.ts # Domain-based product queries
│   │   ├── productsController.ts # Product CRUD operations
│   │   └── videoController.ts   # Video generation endpoints
│   ├── routes/                  # Route definitions
│   ├── utils/                   # Utility functions
│   │   ├── Dailymotion/        # Dailymotion Partner API integration
│   │   │   └── index.ts         # Authentication and video publishing
│   │   ├── KlingAi/            # Kling AI service integration
│   │   │   ├── videoService.ts  # Main video generation service
│   │   │   └── token.ts         # JWT token generation
│   │   ├── scrapeGraphUtils.ts  # Web scraping utilities
│   │   └── form.ts             # Form data utilities
│   ├── migrations/              # Database migration files
│   ├── schema.ts               # Database schema definitions
│   └── server.ts               # Main server entry point
├── src/                        # Frontend React application
│   ├── components/             # Reusable UI components
│   │   ├── ProductCard.tsx     # Main product display component
│   │   ├── UrlSubmissionForm.tsx # Product URL input form
│   │   └── Layout.tsx          # App layout wrapper
│   ├── lib/                    # Frontend utilities
│   │   ├── api.ts             # API type definitions
│   │   └── queries.ts         # React Query hooks
│   └── pages/                  # Page components
```

│ └── server.ts # Main server entry point
├── src/ # Frontend React application
│ ├── components/ # Reusable UI components
│ │ ├── ProductCard.tsx # Main product display component
│ │ ├── UrlSubmissionForm.tsx # Product URL input form
│ │ └── Layout.tsx # App layout wrapper
│ ├── lib/ # Frontend utilities
│ │ ├── api.ts # API type definitions
│ │ └── queries.ts # React Query hooks
│ └── pages/ # Page components

````

## Coding Patterns & Conventions

### Database Schema (Drizzle ORM)

```typescript
// Use Drizzle ORM patterns for schema definitions
export const products = sqliteTable("products", {
  id: integer("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title"),
  description: text("description"),
  images: text("images"), // JSON string array
  videoStatus: text("videoStatus")
    .$type<"unavailable" | "processing" | "finish" | "error">()
    .default("unavailable"),
  videoUrl: text("videoUrl"),
  videoTaskId: text("videoTaskId"),
  dailymotionId: text("dailymotion_id"), // Dailymotion video ID
  dailymotionStatus: text("dailymotion_status")
    .$type<"not_published" | "publishing" | "published" | "error">()
    .default("not_published"),
  dailymotionUrl: text("dailymotion_url"), // Dailymotion video URL
  createdAt: text("createdAt").default(sql`CURRENT_TIMESTAMP`),
});
````

### API Controllers (Hono.js)

```typescript
// Use Hono.js patterns for route handlers
export const videoController = new Hono()
  .post("/generate/:productId", async (c) => {
    const productId = parseInt(c.req.param("productId"));
    // Implementation...
    return c.json({ success: true, data: result });
  })
  .get("/status/:productId", async (c) => {
    // Status checking implementation...
  });

export const dailymotionController = new Hono()
  .post("/publish/:productId", async (c) => {
    const productId = parseInt(c.req.param("productId"));
    // Publish video to Dailymotion platform
    return c.json({ success: true, data: result });
  })
  .get("/status/:productId", async (c) => {
    // Check Dailymotion publishing status
  });
```

### React Query Hooks

```typescript
// Use React Query for all server state management
export const useGenerateVideoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generateVideo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
```

### TypeScript Types

```typescript
// Define comprehensive types for all data structures
export interface Product {
  id: number;
  url: string;
  title: string | null;
  description: string | null;
  images: string[]; // Array of image URLs
  videoStatus: "unavailable" | "processing" | "finish" | "error";
  videoUrl: string | null;
  createdAt: string;
}
```

## Key Components & Their Patterns

### ProductCard Component

- **Horizontal layout**: Image on left (192x192px), content on right
- **Status indicators**: Real-time video generation status with icons
- **Action buttons**: Generate Video, View Product, Watch Video
- **Error handling**: Graceful fallbacks for broken images
- **Responsive design**: Tailwind CSS classes for consistent styling

```typescript
// Example pattern for ProductCard
function ProductCard({ product }: ProductCardProps) {
  const generateVideoMutation = useGenerateVideoMutation();
  const { data: videoStatus } = useVideoStatusQuery(product.id, shouldPoll);

  // Component implementation...
}
```

### Video Generation Service (Kling AI)

- **Base64 image conversion**: Convert image URLs to base64 for API
- **JWT authentication**: Generate tokens using access/secret keys
- **Error handling**: Comprehensive error logging and user feedback
- **Status tracking**: Poll for completion and update database

```typescript
// Example pattern for KlingAiService
export class KlingAiService {
  private async imageUrlToBase64(imageUrl: string): Promise<string> {
    // Convert URL to base64 implementation
  }

  async generateProductVideo(
    imageUrl: string,
    title: string,
    description: string
  ): Promise<KlingVideoResponse> {
    // Video generation implementation
  }
}
```

## Environment Variables

Always use these environment variables:

- `KLING_AI_ACCESS_KEY` - Kling AI API access key
- `KLING_AI_SECRET_KEY` - Kling AI API secret key
- `DAILYMOTION_CLIENT_ID` - Dailymotion Partner API client ID
- `DAILYMOTION_CLIENT_SECRET` - Dailymotion Partner API client secret
- `DAILYMOTION_USER_ID` - Dailymotion user ID for video publishing
- `DATABASE_URL` - SQLite database file path (optional)

## API Endpoints

### Products API

- `GET /api/products` - List all products
- `POST /api/products` - Create product from URL
- `GET /api/products/domain/:domain` - Get products by domain

### Videos API

- `POST /api/videos/generate/:productId` - Generate video for product
- `GET /api/videos/status/:productId` - Check video generation status
- `GET /api/videos/domain/:domainId` - Get videos for domain

### Dailymotion API

- `POST /api/dailymotion/publish/:productId` - Publish video to Dailymotion
- `GET /api/dailymotion/status/:productId` - Check Dailymotion publishing status

## Common Development Tasks

### Adding New Controllers

1. Create controller in `server/controllers/`
2. Define routes using Hono.js patterns
3. Add route imports to `server/routes/index.ts`
4. Use Drizzle ORM for database operations
5. Return consistent JSON responses: `{ success: boolean, data?: any, error?: string }`

### Adding React Components

1. Use TypeScript with proper prop interfaces
2. Implement Tailwind CSS for styling
3. Use React Query for server state
4. Follow horizontal layout patterns for consistency
5. Include proper error boundaries and loading states

### Database Changes

1. Update `server/schema.ts` with new fields
2. Generate migration: `bun run db:generate`
3. Apply migration: `bun run db:migrate`
4. Update TypeScript types in `src/lib/api.ts`

### API Integration

1. Add service function to appropriate utility file
2. Create React Query hook in `src/lib/queries.ts`
3. Use hook in components with proper error handling
4. Implement optimistic updates where appropriate

## Code Quality Guidelines

### Error Handling

- Always wrap async operations in try-catch blocks
- Log errors with context: `console.error("Operation failed:", error)`
- Return user-friendly error messages
- Use React Query's error states for UI feedback

### Performance

- Use React Query for caching and background updates
- Implement proper loading states for all async operations
- Use optimistic updates for immediate user feedback
- Debounce user inputs where appropriate

### Styling

- Use Tailwind CSS utility classes consistently
- Follow existing color scheme: purple for primary actions, blue for secondary
- Implement responsive design with mobile-first approach
- Use Lucide icons for consistency

### TypeScript

- Define interfaces for all data structures
- Use strict typing for API responses
- Implement proper error types
- Use generics where appropriate for reusability

## Testing Patterns

When implementing new features, consider:

- API endpoint testing with proper mock data
- React component testing with React Testing Library
- Error scenario testing (network failures, invalid data)
- Integration testing for video generation workflow

## Deployment Considerations

- Frontend builds to `dist/` directory (static files)
- Backend runs on Node.js/Bun with environment variables
- Database uses SQLite with file-based storage
- Requires Kling AI API credentials for video generation

## Common Pitfalls to Avoid

1. **Environment Variables**: Always check for required env vars in server startup
2. **Image Processing**: Validate image URLs before processing
3. **Database Queries**: Use proper error handling for all DB operations
4. **React Query**: Don't forget to invalidate queries after mutations
5. **Video Generation**: Handle long-running processes with proper status updates
6. **Tailwind CSS**: Use existing utility classes instead of custom CSS
7. **Type Safety**: Always type API responses and component props

## Integration Points

### Kling AI API

- Requires JWT authentication with iss, exp, nbf claims
- Expects base64-encoded images (not URLs)
- Returns task IDs for status tracking
- Has rate limits and usage quotas

### Dailymotion Partner API

- Uses OAuth 2.0 client credentials flow for authentication
- Requires client ID, client secret, and user ID
- Publishes videos with metadata (title, description, thumbnail)
- Returns video ID and publishing status
- Supports private/public video publishing

### ScrapeGraph Integration

- Extracts product data from e-commerce URLs
- Returns structured data: title, description, images, price
- Handle cases where scraping fails or returns incomplete data

### Database Schema Evolution

- Products table is central entity
- Video fields added for status tracking
- Dailymotion fields added for publishing status
- Use migrations for schema changes
- Maintain backward compatibility

## Server-Specific Guidelines

### Hono.js Server Patterns

- Use middleware for CORS and request logging
- Implement proper error handling with try-catch blocks
- Return consistent JSON response format
- Use context parameter (c) for request/response operations

### Database Operations

- Use Drizzle ORM query builder syntax
- Implement proper connection management
- Use transactions for complex operations
- Handle database errors gracefully

### Video Processing

- Convert images to base64 before sending to Kling AI
- Implement status polling mechanisms
- Store task IDs for tracking long-running operations
- Handle API rate limits and failures

This instruction set should help GitHub Copilot provide more accurate and contextual suggestions for this specific Image-to-Video AI project.
