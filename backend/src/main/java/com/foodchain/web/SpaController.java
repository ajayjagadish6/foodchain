package com.foodchain.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * SPA fallback so client-side routes work on refresh.
 */
@Controller
public class SpaController {

    @RequestMapping(value = {"/{path:[^\\.]*}", "/{path:^(?!api$).*}/**/{subpath:[^\\.]*}"})
    public String forward() {
        return "forward:/index.html";
    }
}
