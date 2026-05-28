package com.techcommunity.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.techcommunity.dto.response.CategoryTreeResponse;
import com.techcommunity.entity.Category;
import com.techcommunity.exception.BusinessException;
import com.techcommunity.mapper.CategoryMapper;
import com.techcommunity.mapper.PostMapper;
import com.techcommunity.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryMapper categoryMapper;
    private final PostMapper postMapper;

    @Override
    public List<CategoryTreeResponse> getTree() {
        return getTree(false);
    }

    @Override
    public List<CategoryTreeResponse> getTree(boolean includeDisabled) {
        LambdaQueryWrapper<Category> wrapper = new LambdaQueryWrapper<Category>()
                .orderByAsc(Category::getSortOrder);
        if (!includeDisabled) {
            wrapper.eq(Category::getStatus, 1);
        }
        List<Category> categories = categoryMapper.selectList(wrapper);
        return buildTree(categories, 0L);
    }

    @Override
    public CategoryTreeResponse getById(Long id) {
        Category category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException(404, "板块不存在");
        }
        return convertToResponse(category);
    }

    @Override
    @Transactional
    public Long create(CategoryTreeResponse request) {
        Category category = new Category();
        category.setParentId(request.getParentId() != null ? request.getParentId() : 0L);
        category.setName(request.getName());
        category.setIcon(request.getIcon());
        category.setDescription(request.getDescription());
        category.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);
        category.setStatus(1);
        category.setPostCount(0);
        categoryMapper.insert(category);
        return category.getId();
    }

    @Override
    @Transactional
    public void update(Long id, CategoryTreeResponse request) {
        Category category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException(404, "板块不存在");
        }
        if (request.getName() != null) {
            category.setName(request.getName());
        }
        if (request.getIcon() != null) {
            category.setIcon(request.getIcon());
        }
        if (request.getDescription() != null) {
            category.setDescription(request.getDescription());
        }
        if (request.getSortOrder() != null) {
            category.setSortOrder(request.getSortOrder());
        }
        if (request.getStatus() != null) {
            category.setStatus(request.getStatus());
        }
        categoryMapper.updateById(category);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Long childCount = categoryMapper.selectCount(
                new LambdaQueryWrapper<Category>().eq(Category::getParentId, id)
        );
        if (childCount > 0) {
            throw new BusinessException(409, "该板块存在子板块，无法删除");
        }
        categoryMapper.deleteById(id);
    }

    @Override
    @Transactional
    public void updateStatus(Long id, Integer status) {
        Category category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException(404, "板块不存在");
        }
        category.setStatus(status);
        categoryMapper.updateById(category);
    }

    @Override
    @Transactional
    public void updateSort(Long id, Integer sortOrder) {
        Category category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException(404, "板块不存在");
        }
        category.setSortOrder(sortOrder);
        categoryMapper.updateById(category);
    }

    private List<CategoryTreeResponse> buildTree(List<Category> categories, Long parentId) {
        Map<Long, List<Category>> groupedByParent = categories.stream()
                .collect(Collectors.groupingBy(Category::getParentId));

        return buildTreeRecursive(groupedByParent, parentId);
    }

    private List<CategoryTreeResponse> buildTreeRecursive(Map<Long, List<Category>> groupedByParent, Long parentId) {
        List<Category> children = groupedByParent.get(parentId);
        if (children == null || children.isEmpty()) {
            return new ArrayList<>();
        }

        return children.stream()
                .map(category -> {
                    CategoryTreeResponse response = convertToResponse(category);
                    response.setChildren(buildTreeRecursive(groupedByParent, category.getId()));
                    return response;
                })
                .collect(Collectors.toList());
    }

    private CategoryTreeResponse convertToResponse(Category category) {
        CategoryTreeResponse response = new CategoryTreeResponse();
        response.setId(category.getId());
        response.setParentId(category.getParentId());
        response.setName(category.getName());
        response.setIcon(category.getIcon());
        response.setDescription(category.getDescription());
        response.setSortOrder(category.getSortOrder());
        response.setStatus(category.getStatus());
        response.setPostCount(category.getPostCount());
        response.setCreatedAt(category.getCreatedAt());
        return response;
    }
}
