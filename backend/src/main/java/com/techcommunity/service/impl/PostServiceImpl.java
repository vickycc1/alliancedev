package com.techcommunity.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.techcommunity.common.Constants;
import com.techcommunity.common.ErrorCode;
import com.techcommunity.common.PageResult;
import com.techcommunity.dto.request.PostCreateRequest;
import com.techcommunity.dto.response.*;
import com.techcommunity.entity.*;
import com.techcommunity.exception.BusinessException;
import com.techcommunity.mapper.*;
import com.techcommunity.service.ContentFilterService;
import com.techcommunity.service.PostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final PostMapper postMapper;
    private final CategoryMapper categoryMapper;
    private final UserMapper userMapper;
    private final UserRoleMapper userRoleMapper;
    private final RoleMapper roleMapper;
    private final LikeMapper likeMapper;
    private final FavoriteMapper favoriteMapper;
    private final AiResponseMapper aiResponseMapper;
    private final ContentFilterService contentFilterService;

    @Override
    @Transactional
    public Long createPost(PostCreateRequest request, Long userId) {
        Category category = categoryMapper.selectById(request.getCategoryId());
        if (category == null || category.getStatus() != Constants.CATEGORY_STATUS_ENABLED) {
            throw new BusinessException(ErrorCode.CATEGORY_NOT_FOUND);
        }

        Long childCount = categoryMapper.selectCount(
                new LambdaQueryWrapper<Category>().eq(Category::getParentId, request.getCategoryId())
        );
        if (childCount > 0) {
            throw new BusinessException(ErrorCode.CATEGORY_NOT_LEAF);
        }

        String title = contentFilterService.cleanHtml(request.getTitle());
        String content = contentFilterService.cleanHtml(request.getContent());

        if (contentFilterService.containsSensitiveWord(title) || contentFilterService.containsSensitiveWord(content)) {
            throw new BusinessException(ErrorCode.CONTENT_SENSITIVE);
        }

        Post post = new Post();
        post.setCategoryId(request.getCategoryId());
        post.setUserId(userId);
        post.setTitle(title);
        post.setContent(content);
        post.setSummary(generateSummary(content));
        post.setViewCount(0);
        post.setLikeCount(0);
        post.setCommentCount(0);
        post.setFavoriteCount(0);
        post.setShareCount(0);
        post.setIsTop(0);
        post.setIsEssence(0);
        post.setAiRequested(request.getAiRequested() ? 1 : 0);
        post.setStatus(Constants.POST_STATUS_NORMAL);

        postMapper.insert(post);

        category.setPostCount(category.getPostCount() + 1);
        categoryMapper.updateById(category);

        return post.getId();
    }

    @Override
    public PostResponse getPostDetail(Long postId, Long currentUserId) {
        Post post = postMapper.selectById(postId);
        if (post == null) {
            throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        }

        if (post.getStatus() == Constants.POST_STATUS_DELETED) {
            throw new BusinessException(ErrorCode.POST_DELETED);
        }

        post.setViewCount(post.getViewCount() + 1);
        postMapper.updateById(post);

        return buildPostResponse(post, currentUserId);
    }

    @Override
    @Transactional
    public void updatePost(Long postId, PostCreateRequest request, Long userId) {
        Post post = postMapper.selectById(postId);
        if (post == null) {
            throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        }

        if (!post.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.POST_NO_PERMISSION);
        }

        if (post.getStatus() == Constants.POST_STATUS_BLOCKED) {
            throw new BusinessException(ErrorCode.POST_BLOCKED);
        }

        String title = contentFilterService.cleanHtml(request.getTitle());
        String content = contentFilterService.cleanHtml(request.getContent());

        if (contentFilterService.containsSensitiveWord(title) || contentFilterService.containsSensitiveWord(content)) {
            throw new BusinessException(ErrorCode.CONTENT_SENSITIVE);
        }

        post.setTitle(title);
        post.setContent(content);
        post.setSummary(generateSummary(content));
        if (request.getCategoryId() != null) {
            post.setCategoryId(request.getCategoryId());
        }

        postMapper.updateById(post);
    }

    @Override
    @Transactional
    public void deletePost(Long postId, Long userId) {
        Post post = postMapper.selectById(postId);
        if (post == null) {
            throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        }

        if (!post.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.POST_NO_PERMISSION);
        }

        post.setStatus(Constants.POST_STATUS_DELETED);
        postMapper.updateById(post);

        Category category = categoryMapper.selectById(post.getCategoryId());
        if (category != null && category.getPostCount() > 0) {
            category.setPostCount(category.getPostCount() - 1);
            categoryMapper.updateById(category);
        }
    }

    @Override
    public PageResult<PostResponse> getPostList(Long categoryId, String keyword, String sortBy,
                                                  Boolean isTop, Boolean isEssence, Long authorId,
                                                  Long currentUserId,
                                                  Integer page, Integer size) {
        LambdaQueryWrapper<Post> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Post::getStatus, Constants.POST_STATUS_NORMAL);

        if (categoryId != null) {
            Set<Long> categoryIds = new HashSet<>();
            categoryIds.add(categoryId);
            collectChildCategoryIds(categoryId, categoryIds);
            wrapper.in(Post::getCategoryId, categoryIds);
        }
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(Post::getTitle, keyword).or().like(Post::getContent, keyword));
        }
        if (isTop != null && isTop) {
            wrapper.eq(Post::getIsTop, 1);
        }
        if (isEssence != null && isEssence) {
            wrapper.eq(Post::getIsEssence, 1);
        }
        if (authorId != null) {
            wrapper.eq(Post::getUserId, authorId);
        }

        if ("HOTTEST".equals(sortBy)) {
            wrapper.last("ORDER BY is_top DESC, (view_count * 1 + like_count * 3 + comment_count * 5 + favorite_count * 2) DESC");
        } else if ("MOST_COMMENTS".equals(sortBy)) {
            wrapper.orderByDesc(Post::getIsTop);
            wrapper.orderByDesc(Post::getCommentCount);
        } else {
            wrapper.orderByDesc(Post::getIsTop);
            wrapper.orderByDesc(Post::getCreatedAt);
        }

        Page<Post> pageResult = postMapper.selectPage(new Page<>(page, size), wrapper);

        List<Post> posts = pageResult.getRecords();
        if (posts.isEmpty()) {
            return PageResult.of(Collections.emptyList(), pageResult.getTotal(), page, size);
        }

        Set<Long> userIds = posts.stream().map(Post::getUserId).collect(Collectors.toSet());
        Set<Long> categoryIds = posts.stream().map(Post::getCategoryId).collect(Collectors.toSet());

        Map<Long, User> userMap = userMapper.selectBatchIds(userIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));
        Map<Long, Category> categoryMap = categoryMapper.selectBatchIds(categoryIds).stream()
                .collect(Collectors.toMap(Category::getId, Function.identity()));

        List<PostResponse> list = posts.stream()
                .map(post -> buildPostListResponse(post, userMap, categoryMap, currentUserId))
                .collect(Collectors.toList());

        return PageResult.of(list, pageResult.getTotal(), page, size);
    }

    @Override
    public PageResult<PostResponse> getPostsByIds(List<Long> postIds, Long currentUserId, Integer page, Integer size) {
        if (postIds == null || postIds.isEmpty()) {
            return PageResult.of(Collections.emptyList(), 0L, page, size);
        }

        LambdaQueryWrapper<Post> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Post::getStatus, Constants.POST_STATUS_NORMAL);
        wrapper.in(Post::getId, postIds);
        wrapper.orderByDesc(Post::getCreatedAt);

        Page<Post> pageResult = postMapper.selectPage(new Page<>(page, size), wrapper);
        List<Post> posts = pageResult.getRecords();
        if (posts.isEmpty()) {
            return PageResult.of(Collections.emptyList(), pageResult.getTotal(), page, size);
        }

        Set<Long> userIds = posts.stream().map(Post::getUserId).collect(Collectors.toSet());
        Set<Long> categoryIds = posts.stream().map(Post::getCategoryId).collect(Collectors.toSet());

        Map<Long, User> userMap = userMapper.selectBatchIds(userIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));
        Map<Long, Category> categoryMap = categoryMapper.selectBatchIds(categoryIds).stream()
                .collect(Collectors.toMap(Category::getId, Function.identity()));

        List<PostResponse> list = posts.stream()
                .map(post -> buildPostListResponse(post, userMap, categoryMap, currentUserId))
                .collect(Collectors.toList());

        return PageResult.of(list, (long) postIds.size(), page, size);
    }

    @Override
    @Transactional
    public void topPost(Long postId, Integer isTop) {
        Post post = postMapper.selectById(postId);
        if (post == null) {
            throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        }
        post.setIsTop(isTop);
        postMapper.updateById(post);
    }

    @Override
    @Transactional
    public void essencePost(Long postId, Integer isEssence) {
        Post post = postMapper.selectById(postId);
        if (post == null) {
            throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        }
        post.setIsEssence(isEssence);
        postMapper.updateById(post);
    }

    @Override
    @Transactional
    public void blockPost(Long postId) {
        Post post = postMapper.selectById(postId);
        if (post == null) {
            throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        }
        post.setStatus(Constants.POST_STATUS_BLOCKED);
        postMapper.updateById(post);

        Category category = categoryMapper.selectById(post.getCategoryId());
        if (category != null && category.getPostCount() > 0) {
            category.setPostCount(category.getPostCount() - 1);
            categoryMapper.updateById(category);
        }
    }

    @Override
    @Transactional
    public void movePost(Long postId, Long categoryId) {
        Post post = postMapper.selectById(postId);
        if (post == null) {
            throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        }
        Category newCategory = categoryMapper.selectById(categoryId);
        if (newCategory == null) {
            throw new BusinessException(ErrorCode.CATEGORY_NOT_FOUND);
        }
        Category oldCategory = categoryMapper.selectById(post.getCategoryId());
        post.setCategoryId(categoryId);
        postMapper.updateById(post);

        if (oldCategory != null && oldCategory.getPostCount() > 0) {
            oldCategory.setPostCount(oldCategory.getPostCount() - 1);
            categoryMapper.updateById(oldCategory);
        }
        newCategory.setPostCount(newCategory.getPostCount() + 1);
        categoryMapper.updateById(newCategory);
    }

    @Override
    @Transactional
    public void adminDeletePost(Long postId) {
        Post post = postMapper.selectById(postId);
        if (post == null) {
            throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        }
        post.setStatus(Constants.POST_STATUS_DELETED);
        postMapper.updateById(post);

        Category category = categoryMapper.selectById(post.getCategoryId());
        if (category != null && category.getPostCount() > 0) {
            category.setPostCount(category.getPostCount() - 1);
            categoryMapper.updateById(category);
        }
    }

    private PostResponse buildPostResponse(Post post, Long currentUserId) {
        PostResponse response = new PostResponse();
        response.setId(post.getId());
        response.setCategoryId(post.getCategoryId());
        response.setTitle(post.getTitle());
        response.setContent(post.getContent());
        response.setSummary(post.getSummary());
        response.setViewCount(post.getViewCount());
        response.setLikeCount(post.getLikeCount());
        response.setCommentCount(post.getCommentCount());
        response.setFavoriteCount(post.getFavoriteCount());
        response.setShareCount(post.getShareCount());
        response.setIsTop(post.getIsTop());
        response.setIsEssence(post.getIsEssence());
        response.setAiRequested(post.getAiRequested());
        response.setStatus(post.getStatus());
        response.setCreatedAt(post.getCreatedAt());
        response.setUpdatedAt(post.getUpdatedAt());

        Category category = categoryMapper.selectById(post.getCategoryId());
        if (category != null) {
            response.setCategoryName(category.getName());
        }

        User author = userMapper.selectById(post.getUserId());
        if (author != null) {
            response.setAuthor(buildUserResponse(author));
        }

        if (post.getAiRequested() == 1) {
            AiResponse aiResponse = aiResponseMapper.selectOne(
                    new LambdaQueryWrapper<AiResponse>().eq(AiResponse::getPostId, post.getId())
            );
            if (aiResponse != null) {
                AiResponseDTO aiDTO = new AiResponseDTO();
                aiDTO.setId(aiResponse.getId());
                aiDTO.setPostId(aiResponse.getPostId());
                aiDTO.setContent(aiResponse.getContent());
                aiDTO.setModel(aiResponse.getModel());
                aiDTO.setStatus(aiResponse.getStatus());
                aiDTO.setCreatedAt(aiResponse.getCreatedAt());
                response.setAiResponse(aiDTO);
            }
        }

        if (currentUserId != null) {
            response.setLiked(isLiked(currentUserId, post.getId(), Constants.TARGET_TYPE_POST));
            response.setFavorited(isFavorited(currentUserId, post.getId()));
        } else {
            response.setLiked(false);
            response.setFavorited(false);
        }

        return response;
    }

    private PostResponse buildPostListResponse(Post post, Map<Long, User> userMap, Map<Long, Category> categoryMap, Long currentUserId) {
        PostResponse response = new PostResponse();
        response.setId(post.getId());
        response.setCategoryId(post.getCategoryId());
        response.setTitle(post.getTitle());
        response.setSummary(post.getSummary());
        response.setViewCount(post.getViewCount());
        response.setLikeCount(post.getLikeCount());
        response.setCommentCount(post.getCommentCount());
        response.setFavoriteCount(post.getFavoriteCount());
        response.setIsTop(post.getIsTop());
        response.setIsEssence(post.getIsEssence());
        response.setAiRequested(post.getAiRequested());
        response.setStatus(post.getStatus());
        response.setCreatedAt(post.getCreatedAt());

        Category category = categoryMap.get(post.getCategoryId());
        if (category != null) {
            response.setCategoryName(category.getName());
        }

        User author = userMap.get(post.getUserId());
        if (author != null) {
            UserSimpleResponse simpleUser = new UserSimpleResponse();
            simpleUser.setId(author.getId());
            simpleUser.setUsername(author.getUsername());
            simpleUser.setNickname(author.getNickname());
            simpleUser.setAvatar(author.getAvatar());
            PostResponse temp = new PostResponse();
            temp.setAuthor(new UserResponse());
            temp.getAuthor().setId(author.getId());
            temp.getAuthor().setUsername(author.getUsername());
            temp.getAuthor().setNickname(author.getNickname());
            temp.getAuthor().setAvatar(author.getAvatar());
            response.setAuthor(temp.getAuthor());
        }

        if (currentUserId != null) {
            response.setLiked(isLiked(currentUserId, post.getId(), Constants.TARGET_TYPE_POST));
            response.setFavorited(isFavorited(currentUserId, post.getId()));
        } else {
            response.setLiked(false);
            response.setFavorited(false);
        }

        return response;
    }

    private UserResponse buildUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setNickname(user.getNickname());
        response.setAvatar(user.getAvatar());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setBio(user.getBio());
        response.setStatus(user.getStatus());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        response.setLastLoginAt(user.getLastLoginAt());

        List<UserRole> userRoles = userRoleMapper.selectList(
                new LambdaQueryWrapper<UserRole>().eq(UserRole::getUserId, user.getId())
        );

        List<String> roles = userRoles.stream()
                .map(ur -> roleMapper.selectById(ur.getRoleId()))
                .filter(role -> role != null)
                .map(Role::getRoleCode)
                .collect(Collectors.toList());
        response.setRoles(roles);

        return response;
    }

    private String generateSummary(String content) {
        if (content == null || content.isEmpty()) {
            return "";
        }
        String plainText = content.replaceAll("<[^>]*>", "");
        if (plainText.length() <= 200) {
            return plainText;
        }
        return plainText.substring(0, 200) + "...";
    }

    private boolean isLiked(Long userId, Long targetId, Integer targetType) {
        return likeMapper.selectCount(
                new LambdaQueryWrapper<Like>()
                        .eq(Like::getUserId, userId)
                        .eq(Like::getTargetId, targetId)
                        .eq(Like::getTargetType, targetType)
        ) > 0;
    }

    private boolean isFavorited(Long userId, Long postId) {
        return favoriteMapper.selectCount(
                new LambdaQueryWrapper<Favorite>()
                        .eq(Favorite::getUserId, userId)
                        .eq(Favorite::getPostId, postId)
        ) > 0;
    }

    private void collectChildCategoryIds(Long parentId, Set<Long> result) {
        List<Category> children = categoryMapper.selectList(
                new LambdaQueryWrapper<Category>().eq(Category::getParentId, parentId)
        );
        for (Category child : children) {
            result.add(child.getId());
            collectChildCategoryIds(child.getId(), result);
        }
    }
}
