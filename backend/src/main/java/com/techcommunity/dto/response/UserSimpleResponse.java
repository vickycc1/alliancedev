package com.techcommunity.dto.response;

import lombok.Data;

@Data
public class UserSimpleResponse {

    private Long id;
    private String username;
    private String nickname;
    private String avatar;
}
