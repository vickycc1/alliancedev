package com.techcommunity.service;

import com.techcommunity.common.PageResult;
import com.techcommunity.dto.response.CategoryTreeResponse;

import java.util.List;

public interface CategoryService {

    List<CategoryTreeResponse> getTree();

    CategoryTreeResponse getById(Long id);

    Long create(CategoryTreeResponse request);

    void update(Long id, CategoryTreeResponse request);

    void delete(Long id);

    void updateStatus(Long id, Integer status);

    void updateSort(Long id, Integer sortOrder);
}
