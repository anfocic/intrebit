import {AuthEnv, buildClearCookie} from "../../lib/auth";

export const onRequestPost: PagesFunction<AuthEnv> = async ({env}) => {
    return new Response(null, {
        status: 204,
        headers: {"set-cookie": buildClearCookie(env)},
    });
};
