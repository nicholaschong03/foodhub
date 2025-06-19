import { z } from 'zod';

// Schema for creating a like
export const CreatePostLikeSchema = z.object({
    postId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid post ID format"),
    userId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid user ID format")
});

// Schema for query parameters when fetching likes
export const GetPostLikesQuerySchema = z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('10')
}).refine(data => data.page > 0, {
    message: "Page number must be greater than 0"
}).refine(data => data.limit > 0 && data.limit <= 50, {
    message: "Limit must be between 1 and 50"
});

// Schema for the response when fetching likes
export const PostLikeResponseSchema = z.object({
    userId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid user ID format"),
    postId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid post ID format"),
    createdAt: z.date()
});

// Schema for the paginated response
export const PaginatedLikesResponseSchema = z.object({
    likes: z.array(PostLikeResponseSchema),
    currentPage: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
    totalLikes: z.number().int().nonnegative()
});

// Type inference from schemas
export type CreatePostLike = z.infer<typeof CreatePostLikeSchema>;
export type GetPostLikesQuery = z.infer<typeof GetPostLikesQuerySchema>;
export type PostLikeResponse = z.infer<typeof PostLikeResponseSchema>;
export type PaginatedLikesResponse = z.infer<typeof PaginatedLikesResponseSchema>;