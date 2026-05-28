package com.techcommunity.controller;

import com.techcommunity.common.Result;
import com.techcommunity.dto.response.CategoryTreeResponse;
import com.techcommunity.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/tree")
    public Result<List<CategoryTreeResponse>> getTree(
            @RequestParam(required = false, defaultValue = "false") Boolean includeDisabled) {
        List<CategoryTreeResponse> tree = categoryService.getTree(includeDisabled);
        return Result.success(tree);
    }

    @GetMapping("/{id}")
    public Result<CategoryTreeResponse> getById(@PathVariable Long id) {
        CategoryTreeResponse category = categoryService.getById(id);
        return Result.success(category);
    }

    @PostMapping
    public Result<Long> create(@RequestBody CategoryTreeResponse request) {
        Long id = categoryService.create(request);
        return Result.success(id);
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @RequestBody CategoryTreeResponse request) {
        categoryService.update(id, request);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return Result.success();
    }

    @PutMapping("/{id}/status")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        categoryService.updateStatus(id, status);
        return Result.success();
    }

    @PutMapping("/{id}/sort")
    public Result<Void> updateSort(@PathVariable Long id, @RequestParam Integer sortOrder) {
        categoryService.updateSort(id, sortOrder);
        return Result.success();
    }
}
